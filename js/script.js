const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const $main = $('main');
const $welcomePanel = $('#welcome-panel');
const $testPanel = $('#test-panel');
const $resultsPanel = $('#results-panel');
const $tradSimpToggle = $('#trad-simp-toggle');
const $beginTestBtn = $('#begin-test-button');
const $repeatTestBtn = $('#repeat-test-button');
const $yesBtn = $('#yes-button');
const $noBtn = $('#no-button');
const $character = $('#character');
const $estimate = $('#estimate');
const $result = $('#result-message');

let test;

const page = {
  startNewTest() {
    test = new Test($tradSimpToggle.checked);
    this.showCharacter(test.testCharFreq);
    this.showPanel(2);
    $estimate.textContent = '...';
  },
  showTestResults(results) {
    this.showPanel(3);
    $result.textContent = `Congratulations, according to our clever algorithms, you know approximately ${results.charsKnown} Chinese characters!`;
    this.showChart(results);
  },
  showPanel(panelIndex) {
    $main.dataset.showPanel = panelIndex;
  },
  showCharacter(charFreq) {
    $character.textContent = test.charList[charFreq];
  },
  showLiveEstimate(estimate) {
    $estimate.textContent = estimate;
  },
  showChart(results) {
    let sampleFreqValues = range(0, test.charList.length, 100);
    let chances = sampleFreqValues.map(freq => getChanceOfKnown(results.charsKnown, freq));
    let chancePoints = chances.map((chance, index) => ({ x: sampleFreqValues[index], y: chance }));
    let chancePointsFiltered = chancePoints.filter(point => point.y > 0.001);
    console.log(chancePointsFiltered);
    let calculatedScore = chancePointsFiltered.reduce((acc, point) => (acc += point.y), 0);
    console.log(calculatedScore * 100);
    // let chancePointsFiltered = chancePoints.filter(point => point.y > 0.001 && point.y < 0.999);

    // let labels = [...chancePointsFiltered.map(point => point.x)];

    let ctx = document.getElementById('main-chart').getContext('2d');
    let mainChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Chance is known curve',
            data: chancePointsFiltered,
            pointRadius: 0,
            // showLine: false,
            // fill: true,
            backgroundColor: 'rgba(170,56,30,0.2)',
            borderColor: 'rgba(170,56,30,0.2)',
          },
          {
            label: 'Estimated number of characters known',
            data: [
              {
                x: results.charsKnown,
                y: 0.5,
              },
            ],
            pointBorderColor: 'rgb(170,56,30)',
            pointBackgroundColor: 'rgb(170,56,30)',
          },
        ],
      },
      options: {
        showLines: true,
        title: {
          display: true,
          text: 'Estimated chances of character being known vs frequency rank',
        },
        legend: { display: false },
        tooltips: { enabled: false },
        hover: { mode: null },
        scales: {
          xAxes: [
            {
              type: 'linear',
              position: 'bottom',
              scaleLabel: {
                display: true,
                labelString: 'Characer frequency rank',
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                min: 0,
                max: this.max,
                callback: function (value) {
                  return ((value / this.max) * 100).toFixed(0) + '%'; // convert to percentage
                },
              },
              scaleLabel: {
                display: true,
                labelString: 'Chance character is known',
              },
            },
          ],
        },
      },
    });
  },
};

class Answer {
  constructor(charFreq, known) {
    this.charFreq = charFreq;
    this.known = known;
  }
}

class Results {
  constructor(charsKnown, standardDev) {
    this.charsKnown = charsKnown;
    this.standardDev = standardDev;
  }
}

class Test {
  constructor(useTraditionalChars) {
    this.answers = [];
    this.estimates = [0];
    this.placementFreqs = [randomInt(25, 75), randomInt(100, 200), randomInt(300, 600), randomInt(1000, 1700), randomInt(1750, 2500)];
    this.testCharFreq = this.placementFreqs[0];
    this.isPlacement = true;
    this.charList = useTraditionalChars ? traditionalCharList : simplifiedCharList;
    this.results = null;
  }
  countKnown() {
    return this.answers.reduce((count, ans) => (ans.known ? ++count : count), 0);
  }
  countUnknown() {
    return this.answers.reduce((count, ans) => (ans.known ? count : ++count), 0);
  }
  getStreakLength() {
    let streak = 1;
    let i = this.answers.length - 1;
    while (i > 0 && this.answers[i].known == this.answers[i - 1].known) {
      streak++;
      i--;
    }
    return streak;
  }
  getCurrentEstimate() {
    return this.estimates[this.estimates.length - 1];
  }
  getRecentEstimates(numOfEstimates) {
    return this.estimates.slice(-(numOfEstimates + 1), this.estimates.length - 1);
  }
  processAnswer(known) {
    this.answers.push(new Answer(this.testCharFreq, known));
    this.estimate(known);
    this.updatePlacementStatus();
    this.updateResults();
    if (this.results != null) {
      page.showTestResults(this.results);
    } else {
      this.setTestCharFreq();
      page.showCharacter(this.testCharFreq);
      page.showLiveEstimate(Math.round(this.getCurrentEstimate()));
    }
  }
  estimate(known) {
    let newEstimate = this.getCurrentEstimate();

    if (this.isPlacement) {
      newEstimate += known ? this.testCharFreq : 0;
    } else {
      newEstimate += this.getStreakLength() * getEloRatingChange(newEstimate, this.testCharFreq, Number(known), this.answers.length);
    }

    this.estimates.push(Math.round(Math.max(newEstimate, 0)));
  }
  updatePlacementStatus() {
    if (this.countUnknown() > 1 || this.countKnown() * 2 - this.countUnknown() > 4 || this.countUnknown() > this.countKnown()) {
      this.isPlacement = false;
    }
  }
  updateResults() {
    // TODO: consider only non-placement estimates here
    if (this.answers.length >= 10) {
      let lastTenEstimates = this.getRecentEstimates(10);
      let recentAverage = lastTenEstimates.reduce((sum, num) => sum + num) / 10;
      let sd = standardDeviation(lastTenEstimates);
      let relativeSD = sd / recentAverage;
      if ((relativeSD < 0.1 && sd < 150) || sd < 2) {
        this.results = new Results(Math.max(Math.round(recentAverage), this.countKnown()), Math.round(sd));
      }
    }
  }
  setTestCharFreq() {
    if (this.isPlacement) {
      this.testCharFreq = this.placementFreqs[this.countKnown() * 2 - this.countUnknown()];
    } else {
      let targetCharFreq = clamp(this.getCurrentEstimate(), 0, this.charList.length - 1);
      this.testCharFreq = findClosestUnseenIndex(
        targetCharFreq,
        this.charList,
        this.answers.map(answer => answer.charFreq)
      );
    }
  }
  logState() {
    console.group('Test state');
    console.log('Placement freqs: ' + this.placementFreqs);
    console.log('Answers:');
    console.table(this.answers);
    console.log('Number of answers: ' + this.answers.length);
    console.log('Unknown chars: ' + this.countUnknown());
    console.log('Streak: ' + this.getStreakLength());
    console.log('Current char frequency: ' + this.testCharFreq);
    console.log('Estimates of chars known: ' + this.estimates);
    console.groupEnd();
  }
}

$beginTestBtn.addEventListener('click', function () {
  page.startNewTest();
  // test.logState();
});

$repeatTestBtn.addEventListener('click', function () {
  page.startNewTest();
  // test.logState();
});

$yesBtn.addEventListener('click', function () {
  test.processAnswer(true);
  // test.logState();
});

$noBtn.addEventListener('click', function () {
  test.processAnswer(false);
  // test.logState();
});

function randomInt(lowerBound, upperBound) {
  let range = upperBound - lowerBound;
  return lowerBound + Math.floor(Math.random() * (range + 1));
}

function getEloRatingChange(userRating, charRating, outcome, answerCount) {
  let chanceIsKnown = getChanceOfKnown(userRating, charRating);
  // let k = 32 + userRating / answerCount;
  let k = 2 + userRating / answerCount;
  return Math.round(k * (outcome - chanceIsKnown));
}

function getChanceOfKnown(userRating, charRating) {
  return 1 / (1 + Math.pow(10, (charRating - userRating) / 400));
}

function clamp(inputValue, lowerBound, upperBound) {
  return Math.max(Math.min(inputValue, upperBound), lowerBound);
}

function findClosestUnseenIndex(targetIndex, targetArray, seenIndices) {
  let counter = 0;

  while (true) {
    if (targetIndex >= 0 && targetIndex < targetArray.length && !seenIndices.includes(targetIndex)) {
      return targetIndex;
    }
    counter < 0 ? counter-- : counter++;
    counter *= -1;
    targetIndex += counter;
  }

  // TODO: add check for if all indices have been seen, if yes return -1
  return -1;
}

function standardDeviation(array) {
  let n = array.length;
  let mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

function range(lowerBound, upperBound, step = 1) {
  let returnArray = [],
    i = 0;
  do {
    returnArray.push(lowerBound + i * step);
    i++;
  } while (lowerBound + i * step < upperBound);
  return returnArray;
}

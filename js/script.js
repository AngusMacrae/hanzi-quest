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
  },
  showTestResults() {
    $result.textContent = `Congratulations, according to our clever algorithms, you know approximately ${test.results.charsKnown} Chinese characters!`;
    this.showPanel(3);
  },
  showPanel(panelIndex) {
    $main.dataset.showPanel = panelIndex;
  },
  showCharacter(charFreq) {
    $character.textContent = test.charList[charFreq];
  },
  showLiveEstimate(estimate) {
    $estimate.innerHTML = 'Estimated number of characters known: ' + estimate;
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
      page.showTestResults();
    } else {
      this.setTestCharFreq(known);
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
    if (this.countUnknown() > 1 || this.countKnown() * 2 - this.countUnknown() > 4) {
      this.isPlacement = false;
    }
  }
  updateResults() {
    if (this.answers.length >= 10) {
      let lastTenEstimates = this.getRecentEstimates(10);
      let average = lastTenEstimates.reduce((sum, num) => sum + num) / 10;
      let sd = standardDeviation(lastTenEstimates);
      let relativeSD = sd / average;
      if (relativeSD < 0.1 && sd < 150) {
        this.results = new Results(average, sd);
      }
    }
  }
  setTestCharFreq(known) {
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
  let chanceIsKnown = 1 / (1 + Math.pow(10, (charRating - userRating) / 400));
  // let k = 32 + userRating / answerCount;
  let k = userRating / answerCount;
  return Math.round(k * (outcome - chanceIsKnown));
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

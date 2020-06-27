// TODO:
// find a better frequency list
// adjust k value in elo function to speed up intial convergence
// add button for undoing last answer
// add option to toggle between traditional/simplified characters
// build results panel (grid of HSK chars etc)

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const $main = $('main');
const $welcomePanel = $('#welcome-panel');
const $testPanel = $('#test-panel');
const $resultsPanel = $('#results-panel');
const $beginTestBtn = $('#begin-test-button');
const $repeatTestBtn = $('#repeat-test-button');
const $yesBtn = $('#yes-button');
const $noBtn = $('#no-button');
const $character = $('#character');
const $estimate = $('#estimate');
const $result = $('#result-message');

// console.log(freqList);

let test = {};

const page = {
  newTest() {
    test = new Test();
    console.log(test.placementFreqs);
    this.showCharacter(test.currentCharFreq);
    this.showPanel(2);
  },
  showTestResults() {
    $result.textContent = `Congratulations, according to our clever algorithms, you know approximately ${test.estimatedCharsKnown} Chinese characters!`;
    this.showPanel(3);
  },
  showPanel(panelNum) {
    $main.dataset.showPanel = panelNum;
  },
  showCharacter(nextCharFreq) {
    $character.textContent = freqList[nextCharFreq];
  },
  showProvisionalEstimate(estimate) {
    $estimate.innerHTML = 'Estimated number of characters known: ' + estimate;
  },
};

class Test {
  constructor() {
    this.answers = [];
    this.wrongCount = 0;
    this.placementFreqs = randomNumsInRange([50, 150, 450, 1350, 2000], 0.2);
    this.currentCharFreq = this.placementFreqs[0];
    this.estimatedCharsKnown = 0;
    this.isPlacement = true;
  }
  processAnswer(known) {
    this.answers.push({ charFreq: this.currentCharFreq, known: known });
    if (!known) {
      this.wrongCount++;
    }
    this.estimateCharsKnown(known);
    this.updatePlacementStatus();
    if (this.checkResultAccuracy()) {
      page.showTestResults();
    } else {
      this.getNextCharFreq(known);
      page.showCharacter(this.currentCharFreq);
      page.showProvisionalEstimate(Math.round(this.estimatedCharsKnown));
      this.logState();
    }
  }
  estimateCharsKnown(known) {
    let newEstimate = this.estimatedCharsKnown;

    if (this.isPlacement) {
      newEstimate += known ? this.currentCharFreq : -this.currentCharFreq;
    } else {
      newEstimate = elo(newEstimate, this.currentCharFreq, Number(known), this.answers.length);
    }

    this.estimatedCharsKnown = Math.max(newEstimate, 0);
  }
  updatePlacementStatus() {
    // if (this.wrongCount > 1 || (this.answers.length - this.wrongCount) * 2 - this.wrongCount > 4) {
    if (this.answers.length > 2 || (this.wrongCount && this.answers.length)) {
      this.isPlacement = false;
    }
  }
  checkResultAccuracy() {
    if (this.answers.length < 20) {
      return false;
    } else {
      let recentAnswers = this.answers.slice(-10, this.answers.length - 1);
      let recentAnswerFreqs = recentAnswers.map(answer => answer.charFreq);
      let recentAnswersFreqSpread = Math.max(...recentAnswerFreqs) - Math.min(...recentAnswerFreqs);
      let lastAnswerFreq = this.answers[this.answers.length - 1].charFreq;
      console.log('Frequency spread of last 10 answers: ' + recentAnswersFreqSpread);
      console.log('Last answer frequency: ' + lastAnswerFreq);
      if (recentAnswersFreqSpread < lastAnswerFreq * 0.1) {
        return true;
      } else if (lastAnswerFreq < 1000) {
        return true;
      } else {
        return false;
      }
    }
  }
  getNextCharFreq(known) {
    let targetCharFreq;

    if (this.isPlacement) {
      targetCharFreq = this.placementFreqs[(this.answers.length - this.wrongCount) * 2 - this.wrongCount];
    } else {
      targetCharFreq = Math.round(this.estimatedCharsKnown);
    }

    this.currentCharFreq = this.findNearestUnseenCharFreq(targetCharFreq);
  }
  findNearestUnseenCharFreq(targetCharFreq) {
    targetCharFreq = Math.max(targetCharFreq, 0);
    targetCharFreq = Math.min(targetCharFreq, 4999);

    let answeredCharFreqs = this.answers.map(answer => answer.charFreq);
    let counter = 0;

    while (true) {
      if (targetCharFreq >= 0 && targetCharFreq <= 4999 && !answeredCharFreqs.includes(targetCharFreq)) {
        break;
      }
      counter < 0 ? counter-- : counter++;
      counter *= -1;
      targetCharFreq += counter;
    }

    return targetCharFreq;
  }
  logState() {
    console.group('Test state');
    console.log('Answers:');
    console.table(this.answers);
    console.log('Number of answers: ' + this.answers.length);
    console.log('Incorrect answers: ' + this.wrongCount);
    console.log('Current char frequency: ' + this.currentCharFreq);
    console.log('Current estimate of chars known: ' + this.estimatedCharsKnown);
    console.groupEnd();
  }
}

$beginTestBtn.addEventListener('click', function () {
  page.newTest();
  test.logState();
});

$repeatTestBtn.addEventListener('click', function () {
  page.newTest();
  test.logState();
});

$yesBtn.addEventListener('click', function () {
  test.processAnswer(true);
});

$noBtn.addEventListener('click', function () {
  test.processAnswer(false);
});

function randomNumsInRange(inputArray, offsetProportion) {
  return inputArray.map(inputNum => inputNum + Math.round(Math.random() * 2 * inputNum * offsetProportion) - inputNum * offsetProportion);
}

function elo(userRating, charRating, outcome, answerCount) {
  let chanceIsKnown = 1 / (1 + Math.pow(10, (charRating - userRating) / 400));
  let k = 32 + Math.round(userRating / answerCount);
  let userRatingChange = Math.round(k * (outcome - chanceIsKnown));

  console.log('Change in estimated chars known: ' + userRatingChange);
  return userRating + userRatingChange;
}

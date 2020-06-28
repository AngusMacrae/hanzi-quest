// TODO:
// find a better frequency list
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

class Answer {
  constructor(charFreq, known) {
    this.charFreq = charFreq;
    this.known = known;
  }
}

class Test {
  constructor() {
    this.answers = [];
    // TODO: make wrongCount, rightCount, lastAnswerRight and streak methods
    this.wrongCount = 0;
    this.lastAnswerRight = true;
    this.streak = 1;
    this.placementFreqs = [randomInt(25, 75), randomInt(100, 200), randomInt(300, 600), randomInt(1000, 1700), randomInt(1750, 2500)];
    this.currentCharFreq = this.placementFreqs[0];
    this.estimatedCharsKnown = 0;
    this.isPlacement = true;
  }
  processAnswer(known) {
    this.updateAnswers(known);
    this.estimateCharsKnown(known);
    this.updatePlacementStatus();
    if (this.checkResultAccuracy()) {
      page.showTestResults();
    } else {
      this.getNextCharFreq(known);
      page.showCharacter(this.currentCharFreq);
      page.showProvisionalEstimate(Math.round(this.estimatedCharsKnown));
    }
  }
  updateAnswers(known) {
    this.lastAnswerRight == known ? this.streak++ : (this.streak = 1);
    this.lastAnswerRight = known;
    if (!known) this.wrongCount++;
    this.answers.push(new Answer(this.currentCharFreq, known));
  }
  estimateCharsKnown(known) {
    let newEstimate = this.estimatedCharsKnown;

    if (this.isPlacement && known) {
      newEstimate += this.currentCharFreq;
    } else {
      newEstimate += this.streak * getEloRatingChange(newEstimate, this.currentCharFreq, Number(known), this.answers.length);
    }

    this.estimatedCharsKnown = Math.max(newEstimate, 0);
  }
  updatePlacementStatus() {
    if (this.wrongCount > 1 || (this.answers.length - this.wrongCount) * 2 - this.wrongCount > 4) {
      // if (this.answers.length >= 3 || (this.wrongCount && this.answers.length)) {
      this.isPlacement = false;
    }
  }
  checkResultAccuracy() {
    // TODO: move to standalone function
    if (this.answers.length >= 20) {
      // TODO: use recent ratings instead of recent answer frequencies
      let recentAnswers = this.answers.slice(-10, this.answers.length - 1);
      let recentAnswerFreqs = recentAnswers.map(answer => answer.charFreq);
      let recentAnswersFreqSpread = Math.max(...recentAnswerFreqs) - Math.min(...recentAnswerFreqs);
      let lastAnswerFreq = this.answers[this.answers.length - 1].charFreq;
      let passConditions = [recentAnswersFreqSpread < lastAnswerFreq * 0.1, lastAnswerFreq < 500];
      console.log('Frequency spread of last 10 answers: ' + recentAnswersFreqSpread);
      console.log('Last answer frequency: ' + lastAnswerFreq);
      console.log('Pass conditions: ' + passConditions);
      return passConditions.some(cond => cond == true) ? true : false;
    } else {
      return false;
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
    // TODO: move to standalone function
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
    console.log('Placement freqs: ' + this.placementFreqs);
    console.log('Answers:');
    console.table(this.answers);
    console.log('Number of answers: ' + this.answers.length);
    console.log('Incorrect answers: ' + this.wrongCount);
    console.log('Last answer right: ' + this.lastAnswerRight);
    console.log('Streak: ' + this.streak);
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
  test.logState();
});

$noBtn.addEventListener('click', function () {
  test.processAnswer(false);
  test.logState();
});

function randomInt(lowerBound, upperBound) {
  let range = upperBound - lowerBound;
  return lowerBound + Math.floor(Math.random() * (range + 1));
}

function getEloRatingChange(userRating, charRating, outcome, answerCount) {
  let chanceIsKnown = 1 / (1 + Math.pow(10, (charRating - userRating) / 400));
  console.log(chanceIsKnown);
  let k = 32 + Math.round((2 * userRating) / answerCount ** 1.5);
  return Math.round(k * (outcome - chanceIsKnown));
}

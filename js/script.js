// TODO:
// find a better frequency list
// adjust k value in elo function to speed up intial convergence
// add button for undoing last answer
// add option to toggle between traditional/simplified characters
// add uncertainty factor and display results panel when it becomes smaller than threshold value
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
  showFinalTestResult() {
    $result.textContent = `Congratulations, according to our clever algorithms, you know approximately ${test.estimatedCharsKnown} Chinese characters!`;
    this.showPanel(3);
  },
  showPanel(panelNum) {
    $main.dataset.showPanel = panelNum;
  },
  showCharacter(nextCharFreq) {
    $character.textContent = freqList[nextCharFreq];
  },
  showEstimate(estimate) {
    $estimate.innerHTML = 'Estimated number of characters known: ' + estimate;
  },
};

class Test {
  constructor() {
    this.answers = [];
    this.wrongCount = 0;
    this.placementFreqs = randomOffsets([50, 150, 450, 1350, 2000], 10);
    this.currentCharFreq = this.placementFreqs[0];
    this.estimatedCharsKnown = 0;
    this.isPlacement = true;
  }
  processAnswer(known) {
    this.updateAnswers(known);
    this.estimateCharsKnown(known);
    this.updatePlacementStatus();
  }
  updateAnswers(known) {
    this.answers.push({ charFreq: this.currentCharFreq, known: known });
    if (!known) {
      this.wrongCount++;
    }
  }
  estimateCharsKnown(known) {
    // TODO: refactor to use variable called newEstimate
    if (this.isPlacement) {
      this.estimatedCharsKnown += known ? this.currentCharFreq : -this.currentCharFreq;
    } else {
      this.estimatedCharsKnown = elo(this.estimatedCharsKnown, this.currentCharFreq, Number(known), this.answers.length);
    }

    if (this.estimatedCharsKnown < 0) {
      this.estimatedCharsKnown = 0;
    }
  }
  updatePlacementStatus() {
    // if (this.wrongCount > 1 || (this.answers.length - this.wrongCount) * 2 - this.wrongCount > 4) {
    if (this.answers.length > 2 || (this.wrongCount && this.answers.length)) {
      this.isPlacement = false;
    }
  }
  getNextCharFreq(known) {
    let targetCharFreq;

    if (this.isPlacement) {
      targetCharFreq = this.placementFreqs[(this.answers.length - this.wrongCount) * 2 - this.wrongCount];
    } else {
      targetCharFreq = Math.round(this.estimatedCharsKnown);
    }

    this.currentCharFreq = this.findNearestUnseenCharacter(targetCharFreq);
    return this.currentCharFreq;
  }
  findNearestUnseenCharacter(targetCharFreq) {
    switch (true) {
      case targetCharFreq < 0:
        targetCharFreq = 0;
        break;
      case targetCharFreq > 4999:
        targetCharFreq = 4999;
    }

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
    console.group('Test state log');
    console.log('Answers:');
    console.table(this.answers);
    console.log('Answer count: ' + this.answers.length);
    console.log('Incorrect count: ' + this.wrongCount);
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
  // TODO: move below code into processAnswer()
  // if (answerCertain(answeredCharFreqs)) {
  //   page.showFinalTestResult();
  // } else {
  page.showCharacter(test.getNextCharFreq(true));
  page.showEstimate(Math.round(test.estimatedCharsKnown));
  test.logState();
  // }
});

$noBtn.addEventListener('click', function () {
  test.processAnswer(false);
  page.showCharacter(test.getNextCharFreq(false));
  page.showEstimate(Math.round(test.estimatedCharsKnown));
  test.logState();
});

function randomOffsets(inputArray, maxOffset) {
  return inputArray.map(inputNum => inputNum + Math.round(Math.random() * 2 * maxOffset) - maxOffset);
}

function elo(userRating, charRating, outcome, answerCount) {
  let chanceIsKnown = 1 / (1 + Math.pow(10, (charRating - userRating) / 400));
  let k = 32;
  // let k = Math.round(userRating / answerCount + 30); // adjust k

  // console.log('chance of known: ' + chanceIsKnown);
  // console.log('known chars change: ' + Math.round(k * (outcome - chanceIsKnown)));
  return userRating + Math.round(k * (outcome - chanceIsKnown));
}

// function answerCertain(answerArray) {
//   if (answerArray.length < 20) {
//     return false;
//   } else {
//     let lastTenAnswers = answerArray.slice(-10, answerArray.length - 1);
//     let spread = Math.max(...lastTenAnswers) - Math.min(...lastTenAnswers);
//     console.log('spread: ' + spread);
//     console.log('last answer: ' + answerArray[answerArray.length - 1]);
//     if (spread < answerArray[answerArray.length - 1] * 0.15) {
//       return true;
//     } else if (answerArray[answerArray.length - 1] < 1000) {
//       return true;
//     } else {
//       return false;
//     }
//   }
// }

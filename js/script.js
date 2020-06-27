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

// filter only characters from the array
freqList = freqList.filter((el, index) => index % 2 == 0);
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
    this.answerCount = 0;
    this.wrongCount = 0;
    this.placementFreqs = randomOffsets([50, 150, 450, 1350, 2000], 10);
    this.currentCharFreq = this.placementFreqs[0];
    this.estimatedCharsKnown = 0;
    this.isPlacement = true;
  }
  processAnswer(known) {
    this.updateAnswerCounts(known);
    this.estimateCharsKnown(known);
    this.updatePlacementStatus();
  }
  updateAnswerCounts(known) {
    this.answerCount++;
    if (!known) {
      this.wrongCount++;
    }
  }
  estimateCharsKnown(known) {
    if (this.isPlacement) {
      this.estimatedCharsKnown += known ? this.currentCharFreq : -this.currentCharFreq;
    } else {
      this.estimatedCharsKnown = elo(this.estimatedCharsKnown, this.currentCharFreq, Number(known), this.answerCount);
    }

    if (this.estimatedCharsKnown < 0) {
      this.estimatedCharsKnown = 0;
    }
  }
  updatePlacementStatus() {
    // if (this.wrongCount > 1 || (this.answerCount - this.wrongCount) * 2 - this.wrongCount > 4) {
    if (this.answerCount > 2 || (this.wrongCount && this.answerCount)) {
      this.isPlacement = false;
    }
  }
  getNextCharFreq(known) {
    let nextCharFreq;

    if (this.isPlacement) {
      nextCharFreq = this.placementFreqs[(this.answerCount - this.wrongCount) * 2 - this.wrongCount];
    } else {
      nextCharFreq = Math.round(this.estimatedCharsKnown);
    }

    nextCharFreq = nextCharFreq >= 0 ? nextCharFreq : 0;
    nextCharFreq = nextCharFreq <= 4999 ? nextCharFreq : 4999;

    // let counter = 0;

    // if (nextCharFreq < 1) {
    //   nextCharFreq = 1;
    //   while (answeredChars.includes(nextCharFreq)) {
    //     counter += 1;
    //     nextCharFreq += counter;
    //   }
    // } else if (nextCharFreq > 4999) {
    //   nextCharFreq = 4999;
    //   while (answeredChars.includes(nextCharFreq)) {
    //     counter += 1;
    //     nextCharFreq -= counter;
    //   }
    // } else {
    //   while (answeredChars.includes(nextCharFreq)) {
    //     if (counter < 0) {
    //       counter -= 1;
    //     } else {
    //       counter += 1;
    //     }
    //     counter *= -1;
    //     nextCharFreq += counter;
    //   }
    // }
    this.currentCharFreq = nextCharFreq;
    return nextCharFreq;
  }
  logState() {
    console.group('Test state log');
    console.log('Answer count: ' + this.answerCount);
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

  // answeredChars.push(currentCharFreq);
  // if (answerCertain(answeredChars)) {
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

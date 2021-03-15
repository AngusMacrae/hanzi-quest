import Test from './classes/Test.js';
import ResultChart from './classes/ResultChart.js';

const $main = document.querySelector('main');
const $tradSimpToggle = document.querySelector('#trad-simp-toggle');
const $beginTestBtn = document.querySelector('#begin-test-button');
const $repeatTestBtn = document.querySelector('#repeat-test-button');
const $charBox = document.querySelector('#charBox');
const $yesBtn = document.querySelector('#yes-button');
const $noBtn = document.querySelector('#no-button');
const $estimate = document.querySelector('#estimate');
const $result = document.querySelector('#result-count');
const $chartCanvas = document.querySelector('#main-chart');

let test;

function startNewTest() {
  test = new Test($tradSimpToggle.checked);
  page.showPanel(2);
  page.showCharacter(test.newQuestion());
  page.showEstimate('...');
}

function askQuestion() {
  page.showCharacter(test.newQuestion());
  page.showEstimate(Math.round(test.currentEstimate));
}

function displayTestResults() {
  page.showPanel(3);
  page.showResultText(test.result.charsKnown);
  page.showResultChart(test.charList.length, test.result.charsKnown);
}

const page = {
  showPanel(panelIndex) {
    $main.dataset.showPanel = panelIndex;
  },
  showCharacter(character) {
    $charBox.textContent = character;
  },
  showEstimate(estimate) {
    $estimate.textContent = estimate;
  },
  showResultText(charsKnown) {
    $result.textContent = charsKnown;
  },
  showResultChart(charListLength, charsKnown) {
    const chartCanvasContext = $chartCanvas.getContext('2d');
    const mainChart = new ResultChart(chartCanvasContext, charListLength, charsKnown);
  },
};

$beginTestBtn.addEventListener('click', function () {
  startNewTest();
  test.logState();
});

$repeatTestBtn.addEventListener('click', function () {
  startNewTest();
  test.logState();
});

$yesBtn.addEventListener('click', function () {
  test.processAnswer(true);
  if (test.result) {
    displayTestResults();
  } else {
    askQuestion();
  }
  test.logState();
});

$noBtn.addEventListener('click', function () {
  test.processAnswer(false);
  if (test.result) {
    displayTestResults();
  } else {
    askQuestion();
  }
  test.logState();
});

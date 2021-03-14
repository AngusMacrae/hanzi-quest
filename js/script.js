import Test from './classes/Test.js';
import ResultChart from './classes/ResultChart.js';
import range from './functions/range.js';
import getChanceIsKnown from './functions/getChanceIsKnown.js';

const $main = document.querySelector('main');
// const $welcomePanel = document.querySelector('#welcome-panel');
// const $testPanel = document.querySelector('#test-panel');
// const $resultsPanel = document.querySelector('#results-panel');
const $tradSimpToggle = document.querySelector('#trad-simp-toggle');
const $beginTestBtn = document.querySelector('#begin-test-button');
const $repeatTestBtn = document.querySelector('#repeat-test-button');
const $yesBtn = document.querySelector('#yes-button');
const $noBtn = document.querySelector('#no-button');
const $charBox = document.querySelector('#charBox');
const $estimate = document.querySelector('#estimate');
const $result = document.querySelector('#result-message');
const $chartCanvas = document.querySelector('#main-chart');

let test;

export const page = {
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
    $charBox.textContent = test.charList[charFreq];
  },
  showLiveEstimate(estimate) {
    $estimate.textContent = estimate;
  },
  showChart(results) {
    let sampleFreqValues = range(0, test.charList.length, 100);
    let chances = sampleFreqValues.map(freq => getChanceIsKnown(results.charsKnown, freq));
    let chancePoints = chances.map((chance, index) => ({ x: sampleFreqValues[index], y: chance }));
    let chancePointsFiltered = chancePoints.filter(point => point.y > 0.001);
    console.log(chancePointsFiltered);
    let calculatedScore = chancePointsFiltered.reduce((acc, point) => (acc += point.y), 0);
    console.log(calculatedScore * 100);
    // let chancePointsFiltered = chancePoints.filter(point => point.y > 0.001 && point.y < 0.999);

    // let labels = [...chancePointsFiltered.map(point => point.x)];

    let chartCanvasContext = $chartCanvas.getContext('2d');
    let mainChart = new ResultChart(chartCanvasContext, chancePointsFiltered, results.charsKnown);
  },
};

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

import Answer from './Answer.js';
import Result from './Result.js';
import { page } from '../script.js';
import randomInt from '../functions/randomInt.js';
import getEloRatingChange from '../functions/getEloRatingChange.js';
import standardDeviation from '../functions/standardDeviation.js';
import clamp from '../functions/clamp.js';
import findClosestUnseenIndex from '../functions/findClosestUnseenIndex.js';
import { simplifiedCharList, traditionalCharList } from '../../data/charLists.js';

export default class Test {
  constructor(useTraditionalChars) {
    this.answers = [];
    this.estimates = [0];
    this.placementFreqs = [randomInt(25, 75), randomInt(100, 200), randomInt(300, 600), randomInt(1000, 1700), randomInt(1750, 2500)];
    this.testCharFreq = this.placementFreqs[0];
    this.isPlacement = true;
    this.charList = useTraditionalChars ? traditionalCharList : simplifiedCharList;
    this.result = null;
  }
  get knownCount() {
    return this.answers.reduce((count, ans) => (ans.isKnown ? ++count : count), 0);
  }
  get unknownCount() {
    return this.answers.reduce((count, ans) => (ans.isKnown ? count : ++count), 0);
  }
  get streakLength() {
    let streak = 1;
    let i = this.answers.length - 1;
    while (i > 0 && this.answers[i].isKnown == this.answers[i - 1].isKnown) {
      streak++;
      i--;
    }
    return streak;
  }
  get currentEstimate() {
    return this.estimates[this.estimates.length - 1];
  }
  recentEstimates(numOfEstimates) {
    return this.estimates.slice(-(numOfEstimates + 1), this.estimates.length - 1);
  }
  processAnswer(isKnown) {
    this.answers.push(new Answer(this.testCharFreq, isKnown));
    this.newEstimate(isKnown);
    this.updatePlacementStatus();
    this.updateResults();
    if (this.result != null) {
      page.showTestResults(this.result);
    } else {
      this.setTestCharFreq();
      page.showCharacter(this.testCharFreq);
      page.showLiveEstimate(Math.round(this.currentEstimate));
    }
  }
  newEstimate(isKnown) {
    let newEstimate = this.currentEstimate;

    if (this.isPlacement) {
      newEstimate += isKnown ? this.testCharFreq : 0;
    } else {
      newEstimate += this.streakLength * getEloRatingChange(newEstimate, this.testCharFreq, Number(isKnown), this.answers.length);
    }

    this.estimates.push(Math.round(Math.max(newEstimate, 0)));
  }
  updatePlacementStatus() {
    if (this.unknownCount > 1 || this.knownCount * 2 - this.unknownCount > 4 || this.unknownCount > this.knownCount) {
      this.isPlacement = false;
    }
  }
  updateResults() {
    // TODO: consider only non-placement estimates here
    if (this.answers.length >= 10) {
      let lastTenEstimates = this.recentEstimates(10);
      let recentAverage = lastTenEstimates.reduce((sum, num) => sum + num) / 10;
      let sd = standardDeviation(lastTenEstimates);
      let relativeSD = sd / recentAverage;
      if ((relativeSD < 0.1 && sd < 150) || sd < 2) {
        this.result = new Result(Math.max(Math.round(recentAverage), this.knownCount), Math.round(sd));
      }
    }
  }
  setTestCharFreq() {
    if (this.isPlacement) {
      this.testCharFreq = this.placementFreqs[this.knownCount * 2 - this.unknownCount];
    } else {
      let targetCharFreq = clamp(this.currentEstimate, 0, this.charList.length - 1);
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
    console.log('Unknown chars: ' + this.unknownCount);
    console.log('Streak: ' + this.streakLength);
    console.log('Current char frequency: ' + this.testCharFreq);
    console.log('Estimates of chars known: ' + this.estimates);
    console.groupEnd();
  }
}

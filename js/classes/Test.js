import Question from './Question.js';
import Result from './Result.js';
import randomInt from '../functions/randomInt.js';
import streak from '../functions/streak.js';
import standardDeviation from '../functions/standardDeviation.js';
import clamp from '../functions/clamp.js';
import findClosestUnseenIndex from '../functions/findClosestUnseenIndex.js';
import getEloRatingChange from '../functions/getEloRatingChange.js';
import { simplifiedCharList, traditionalCharList } from '../data/charLists.js';

export default class Test {
  constructor(useTraditionalChars) {
    this.charList = useTraditionalChars ? traditionalCharList : simplifiedCharList;
    this.placementFreqs = [randomInt(25, 75), randomInt(100, 200), randomInt(300, 600), randomInt(1000, 1700), randomInt(1750, 2500)];
    this.questions = [];
    this.estimates = [0];
  }
  get currentQuestion() {
    return this.questions[this.questions.length - 1];
  }
  get currentEstimate() {
    return this.estimates[this.estimates.length - 1];
  }
  get knownCount() {
    return this.questions.reduce((count, question) => (question.isKnown === true ? ++count : count), 0);
  }
  get unknownCount() {
    return this.questions.reduce((count, question) => (question.isKnown === false ? ++count : count), 0);
  }
  get currentStreak() {
    return streak(this.questions.map(q => q.isKnown).slice(0, -1));
  }
  get isPlacement() {
    // prettier-ignore
    const conditions = [
      this.unknownCount > 1,
      this.knownCount * 2 - this.unknownCount > 4,
      this.unknownCount > this.knownCount
    ];
    return !conditions.includes(true);
  }
  get result() {
    if (this.questions.length < 10) return null;

    const lastTenEstimates = this.estimates.slice(-11, this.estimates.length - 1);
    const lastTenAvg = lastTenEstimates.reduce((sum, num) => sum + num) / 10;
    const lastTenStdDev = standardDeviation(lastTenEstimates);
    const lastTenRelStdDev = lastTenStdDev / lastTenAvg;

    if ((lastTenRelStdDev < 0.1 && lastTenStdDev < 150) || lastTenStdDev < 2) {
      return new Result(Math.max(Math.round(lastTenAvg), this.knownCount), Math.round(lastTenStdDev));
    } else {
      return null;
    }
  }
  newQuestion() {
    let newCharFreq;

    if (this.isPlacement) {
      newCharFreq = this.placementFreqs[this.knownCount * 2 - this.unknownCount];
    } else {
      const targetCharFreq = clamp(this.currentEstimate, 0, this.charList.length - 1);
      const seenCharFreqs = this.questions.map(question => question.charFreq);
      newCharFreq = findClosestUnseenIndex(targetCharFreq, this.charList, seenCharFreqs);
    }

    const newQuestion = new Question(newCharFreq, this.charList);
    this.questions.push(newQuestion);

    return newQuestion.character;
  }
  processAnswer(isKnown) {
    // TODO: if answer breaks streak, elo change should be halved, instead of resetting to 0
    // maybe instead of streak, can scale by convergence metric instead
    this.currentQuestion.isKnown = isKnown;

    let newEstimate = this.currentEstimate;

    if (this.isPlacement) {
      newEstimate += isKnown ? this.currentQuestion.charFreq : 0;
    } else {
      newEstimate += this.currentStreak * getEloRatingChange(newEstimate, this.currentQuestion.charFreq, Number(isKnown), this.questions.length);
    }

    this.estimates.push(Math.round(Math.max(newEstimate, 0)));
  }
  logState() {
    console.clear();
    console.group('Test state');
    console.log('isPlacement: ' + this.isPlacement);
    console.log('Placement freqs: ' + this.placementFreqs);
    console.log('Questions:');
    console.table(this.questions);
    console.log('Number of questions: ' + this.questions.length);
    console.log('Known chars: ' + this.knownCount);
    console.log('Unknown chars: ' + this.unknownCount);
    console.log('Streak: ' + this.currentStreak);
    console.log('Current char frequency: ' + this.currentQuestion.charFreq);
    console.log('Estimates of chars known: ' + this.estimates);
    console.groupEnd();
  }
}

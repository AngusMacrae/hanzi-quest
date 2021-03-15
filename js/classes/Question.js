export default class Question {
  constructor(charFreq, charList) {
    this.charFreq = charFreq;
    this.isKnown = null;
    this.character = charList[charFreq];
  }
}

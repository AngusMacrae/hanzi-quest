import getChanceIsKnown from './getChanceIsKnown.js';

export default function getEloRatingChange(userRating, charRating, outcome, answerCount) {
  const chanceIsKnown = getChanceIsKnown(userRating, charRating);
  // const k = 32 + userRating / answerCount;
  const k = 2 + userRating / answerCount;
  return Math.round(k * (outcome - chanceIsKnown));
}

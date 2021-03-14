export default function getChanceIsKnown(userRating, charRating) {
  return 1 / (1 + Math.pow(10, (charRating - userRating) / 400));
}

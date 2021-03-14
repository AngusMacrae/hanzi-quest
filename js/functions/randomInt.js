export default function randomInt(lowerBound, upperBound) {
  const range = upperBound - lowerBound;
  return lowerBound + Math.floor(Math.random() * (range + 1));
}

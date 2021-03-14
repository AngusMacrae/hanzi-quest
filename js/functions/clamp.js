export default function clamp(inputValue, lowerBound, upperBound) {
  return Math.max(Math.min(inputValue, upperBound), lowerBound);
}

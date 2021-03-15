export default function streak(array) {
  let streak = 1;
  let i = array.length - 1;
  while (i > 0 && array[i] === array[i - 1]) {
    streak++;
    i--;
  }
  return streak;
}

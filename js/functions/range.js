export default function range(lowerBound, upperBound, step = 1) {
  const returnArray = [];
  let i = 0;
  do {
    returnArray.push(lowerBound + i * step);
    i++;
  } while (lowerBound + i * step < upperBound);
  return returnArray;
}

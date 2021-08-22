export function rangeNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

export function removeItem(item, array) {
  array = array.filter((i) => i !== item);

  return array;
}

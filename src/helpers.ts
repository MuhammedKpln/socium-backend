import * as he from 'he';

export function rangeNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function shuffleArray(array): string[] {
  return array.sort(() => Math.random() - 0.5);
}

export function removeItem(item, array) {
  array = array.filter((i) => i !== item);

  return array;
}

export function stripHtml(html: string) {
  const regex = /(<([^>]+)>)/gi;
  const splittedHtml = html.replace(regex, '');
  const decodeHtml = he.decode(splittedHtml);

  return decodeHtml;
}

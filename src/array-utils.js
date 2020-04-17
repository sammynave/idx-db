export function findMaxKey({ key, arr }) {
  return Math.max(...arr.map((el) => el[key]));
}

export const byIdAsc = (a, b) => a.id - b.id;

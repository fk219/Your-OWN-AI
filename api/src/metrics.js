export function dot(a, b) {
  let sum = 0;
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i += 1) sum += a[i] * b[i];
  return sum;
}

export function norm(a) {
  return Math.sqrt(dot(a, a));
}

export function normalize(vector) {
  const length = norm(vector);
  if (!length) return vector.map(() => 0);
  return vector.map((value) => value / length);
}

export function cosineDistance(a, b) {
  const denominator = norm(a) * norm(b);
  if (!denominator) return 1;
  return 1 - dot(a, b) / denominator;
}

export function euclideanDistance(a, b) {
  let sum = 0;
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export function manhattanDistance(a, b) {
  let sum = 0;
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i += 1) sum += Math.abs(a[i] - b[i]);
  return sum;
}

export function distance(a, b, metric = 'cosine') {
  if (metric === 'euclidean') return euclideanDistance(a, b);
  if (metric === 'manhattan') return manhattanDistance(a, b);
  return cosineDistance(a, b);
}

export const METRICS = ['cosine', 'euclidean', 'manhattan'];

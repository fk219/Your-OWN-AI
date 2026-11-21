import { dot, norm } from './metrics.js';

const powerIteration = (matrix, orthogonalTo = null, iterations = 80) => {
  let vector = matrix.map(() => Math.random() - 0.5);
  for (let step = 0; step < iterations; step += 1) {
    let next = matrix.map((row) => dot(row, vector));
    if (orthogonalTo) {
      const projection = dot(next, orthogonalTo);
      next = next.map((value, index) => value - projection * orthogonalTo[index]);
    }
    const length = norm(next);
    if (!length) break;
    vector = next.map((value) => value / length);
  }
  return vector;
};

export function project2D(vectors) {
  const count = vectors.length;
  const dims = vectors[0]?.length || 0;
  if (count < 2 || dims < 2) return vectors.map(() => ({ x: 0, y: 0 }));

  const mean = Array(dims).fill(0);
  vectors.forEach((vector) => vector.forEach((value, index) => { mean[index] += value / count; }));
  const centered = vectors.map((vector) => vector.map((value, index) => value - mean[index]));

  const covariance = Array.from({ length: dims }, () => Array(dims).fill(0));
  centered.forEach((vector) => {
    for (let i = 0; i < dims; i += 1) {
      for (let j = i; j < dims; j += 1) {
        covariance[i][j] += vector[i] * vector[j];
        if (i !== j) covariance[j][i] = covariance[i][j];
      }
    }
  });

  const first = powerIteration(covariance);
  const firstEigenvalue = dot(first, covariance.map((row) => dot(row, first)));
  const deflated = covariance.map((row, i) =>
    row.map((value, j) => value - firstEigenvalue * first[i] * first[j])
  );
  const second = powerIteration(deflated, first);

  const projected = centered.map((vector) => ({
    x: dot(vector, first),
    y: dot(vector, second)
  }));
  const max = Math.max(
    1e-9,
    ...projected.flatMap((point) => [Math.abs(point.x), Math.abs(point.y)])
  );
  return projected.map((point) => ({ x: point.x / max, y: point.y / max }));
}

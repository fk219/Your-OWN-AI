export function pca2D(embs: number[][]) {
  const n = embs.length;
  const d = embs[0]?.length ?? 0;
  if (n < 2 || d === 0) return embs.map(() => [0, 0]);

  const mean = new Array(d).fill(0);
  for (const e of embs) for (let i = 0; i < d; i++) mean[i] += e[i] / n;
  const X = embs.map((e) => e.map((v, i) => v - mean[i]));

  function powerIter(excl: number[] | null) {
    let v = new Array(d).fill(0).map(() => Math.random() - 0.5);
    if (excl) {
      const dot = v.reduce((s, vi, i) => s + vi * excl[i], 0);
      v = v.map((vi, i) => vi - dot * excl[i]);
    }
    let nrm = Math.sqrt(v.reduce((s, vi) => s + vi * vi, 0));
    v = v.map((vi) => vi / nrm);
    for (let it = 0; it < 200; it++) {
      const Xv = X.map((xi) => xi.reduce((s, xij, j) => s + xij * v[j], 0));
      const nv = new Array(d).fill(0);
      for (let k = 0; k < n; k++) for (let j = 0; j < d; j++) nv[j] += X[k][j] * Xv[k];
      if (excl) {
        const dot = nv.reduce((s, vi, i) => s + vi * excl[i], 0);
        for (let i = 0; i < d; i++) nv[i] -= dot * excl[i];
      }
      nrm = Math.sqrt(nv.reduce((s, vi) => s + vi * vi, 0));
      if (nrm < 1e-10) break;
      const prev = v.slice();
      v = nv.map((vi) => vi / nrm);
      if (v.reduce((s, vi, i) => s + (vi - prev[i]) ** 2, 0) < 1e-12) break;
    }
    return v;
  }

  const pc1 = powerIter(null);
  const pc2 = powerIter(pc1);
  return X.map((x) => [
    x.reduce((s, v, i) => s + v * pc1[i], 0),
    x.reduce((s, v, i) => s + v * pc2[i], 0)
  ]);
}


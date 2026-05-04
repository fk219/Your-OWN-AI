import { describe, expect, it } from "vitest";
import { BruteForce } from "../src/algos/bruteforce.js";
import { KDTree } from "../src/algos/kdtree.js";
import { euclidean } from "../src/math/distance.js";

describe("KDTree", () => {
  it("matches brute force for euclidean", () => {
    const points = [
      { id: 1, embedding: [0, 0] },
      { id: 2, embedding: [10, 0] },
      { id: 3, embedding: [3, 4] },
      { id: 4, embedding: [2, 2] }
    ];

    const bf = new BruteForce();
    const kd = new KDTree(2);
    for (const p of points) {
      bf.insert(p);
      kd.insert(p);
    }

    const q = [1, 1];
    const k = 3;
    const bfRes = bf.knn(q, k, euclidean).map((x) => x.id);
    const kdRes = kd.knn(q, k, euclidean).map((x) => x.id);
    expect(kdRes).toEqual(bfRes);
  });
});


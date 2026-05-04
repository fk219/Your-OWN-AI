import { describe, expect, it } from "vitest";
import { BruteForce } from "../src/algos/bruteforce.js";
import { HNSW } from "../src/algos/hnsw.js";
import { cosine } from "../src/math/distance.js";

describe("HNSW", () => {
  it("returns k results for a simple dataset", () => {
    const bf = new BruteForce();
    const h = new HNSW({ m: 16, efBuild: 200, seed: 42 });
    for (let i = 0; i < 40; i++) {
      const emb = [Math.cos(i / 10), Math.sin(i / 10)];
      bf.insert({ id: i + 1, embedding: emb });
      h.insert({ id: i + 1, embedding: emb }, cosine);
    }
    const res = h.knn([1, 0], 5, 50, cosine);
    expect(res.length).toBe(5);
  });
});


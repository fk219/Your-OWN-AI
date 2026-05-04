import { describe, expect, it } from "vitest";
import { BruteForce } from "../src/algos/bruteforce.js";
import { euclidean } from "../src/math/distance.js";

describe("BruteForce", () => {
  it("returns nearest neighbors", () => {
    const bf = new BruteForce();
    bf.insert({ id: 1, embedding: [0, 0] });
    bf.insert({ id: 2, embedding: [10, 0] });
    bf.insert({ id: 3, embedding: [3, 4] });

    const res = bf.knn([0, 0], 2, euclidean);
    expect(res.map((x) => x.id)).toEqual([1, 3]);
  });
});


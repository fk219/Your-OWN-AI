import { describe, expect, it } from "vitest";
import { cosine, euclidean, manhattan } from "../src/math/distance.js";

describe("distance", () => {
  it("euclidean", () => {
    expect(euclidean([0, 0], [3, 4])).toBeCloseTo(5, 6);
  });

  it("manhattan", () => {
    expect(manhattan([1, 2, 3], [3, 1, 1])).toBe(5);
  });

  it("cosine is 0 for identical vectors", () => {
    expect(cosine([1, 0, 0], [1, 0, 0])).toBeCloseTo(0, 6);
  });
});


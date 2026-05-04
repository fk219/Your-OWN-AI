import { describe, expect, it } from "vitest";
import { VectorDB } from "../src/db/vectorDb.js";

describe("VectorDB", () => {
  it("insert/search/delete", () => {
    const db = new VectorDB(2);
    const id1 = db.insert("a", "cs", [0, 0]);
    const id2 = db.insert("b", "cs", [10, 0]);
    const out = db.search([0, 0], 2, "euclidean", "bruteforce");
    expect(out.results.map((h) => h.id)).toEqual([id1, id2]);
    expect(db.remove(id2)).toBe(true);
    expect(db.remove(999)).toBe(false);
  });
});


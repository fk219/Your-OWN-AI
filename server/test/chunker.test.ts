import { describe, expect, it } from "vitest";
import { chunkText } from "../src/text/chunker.js";

describe("chunkText", () => {
  it("returns one chunk if short", () => {
    expect(chunkText("a b c", 5, 1)).toEqual(["a b c"]);
  });
});


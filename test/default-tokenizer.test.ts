import { describe, expect, it } from "vitest";
import { DefaultTokenizer } from "../src/index.js";

describe("DefaultTokenizer", () => {
  it("lowercases and splits on whitespace", () => {
    const tokenizer = new DefaultTokenizer();

    expect(tokenizer.tokenize("one Two three")).toEqual([
      "one",
      "two",
      "three",
    ]);
    expect(tokenizer.tokenize("one\n Two \nthree")).toEqual([
      "one",
      "two",
      "three",
    ]);
  });

  it("treats non-alphanumeric characters as separators", () => {
    const tokenizer = new DefaultTokenizer();

    expect(tokenizer.tokenize("The cat, sat!")).toEqual(["the", "cat", "sat"]);
  });
});

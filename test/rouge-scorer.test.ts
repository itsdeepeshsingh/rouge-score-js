import { describe, expect, it } from "vitest";
import { RougeScorer } from "../src/index.js";

describe("RougeScorer", () => {
  it("scores rouge1 with precision, recall, and f-measure", () => {
    const scorer = new RougeScorer(["rouge1"]);

    const scores = scorer.score("the cat sat", "the cat");

    expect(scores.rouge1).toEqual({
      precision: 1,
      recall: 2 / 3,
      fmeasure: 0.8,
    });
  });
});

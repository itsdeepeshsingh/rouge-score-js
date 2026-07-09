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

  it("scores rouge1 using token counts instead of unique token sets", () => {
    const scorer = new RougeScorer(["rouge1"]);

    const scores = scorer.score("the the cat", "the cat cat");

    expect(scores.rouge1).toEqual({
      precision: 2 / 3,
      recall: 2 / 3,
      fmeasure: 2 / 3,
    });
  });

  it("returns zero scores when rouge1 has no overlap", () => {
    const scorer = new RougeScorer(["rouge1"]);

    const scores = scorer.score("the cat sat", "dogs run");

    expect(scores.rouge1).toEqual({
      precision: 0,
      recall: 0,
      fmeasure: 0,
    });
  });

  it("returns zero scores when the candidate is empty", () => {
    const scorer = new RougeScorer(["rouge1"]);

    const scores = scorer.score("the cat sat", "");

    expect(scores.rouge1).toEqual({
      precision: 0,
      recall: 0,
      fmeasure: 0,
    });
  });

  it("returns zero scores when the reference is empty", () => {
    const scorer = new RougeScorer(["rouge1"]);

    const scores = scorer.score("", "the cat");

    expect(scores.rouge1).toEqual({
      precision: 0,
      recall: 0,
      fmeasure: 0,
    });
  });

  it("normalizes case and punctuation before scoring rouge1", () => {
    const scorer = new RougeScorer(["rouge1"]);

    const scores = scorer.score("The cat, sat!", "the CAT");

    expect(scores.rouge1).toEqual({
      precision: 1,
      recall: 2 / 3,
      fmeasure: 0.8,
    });
  });
});

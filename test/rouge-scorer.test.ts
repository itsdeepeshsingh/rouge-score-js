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

  it("scores rouge2 with bigram overlap", () => {
    const scorer = new RougeScorer(["rouge2"]);

    const scores = scorer.score("testing one two", "testing one");

    expect(scores.rouge2).toEqual({
      precision: 1,
      recall: 1 / 2,
      fmeasure: 2 / 3,
    });
  });

  it("scores rouge2 using adjacent token pairs instead of word sets", () => {
    const scorer = new RougeScorer(["rouge2"]);

    const scores = scorer.score("the cat sat", "cat the");

    expect(scores.rouge2).toEqual({
      precision: 0,
      recall: 0,
      fmeasure: 0,
    });
  });

  it("returns zero rouge2 scores when either side has fewer than two tokens", () => {
    const scorer = new RougeScorer(["rouge2"]);

    expect(scorer.score("the cat", "the").rouge2).toEqual({
      precision: 0,
      recall: 0,
      fmeasure: 0,
    });
    expect(scorer.score("the", "the cat").rouge2).toEqual({
      precision: 0,
      recall: 0,
      fmeasure: 0,
    });
  });

  it("scores rouge2 using bigram counts instead of unique bigram sets", () => {
    const scorer = new RougeScorer(["rouge2"]);

    const scores = scorer.score("the cat the cat", "the cat the dog");

    expect(scores.rouge2).toEqual({
      precision: 2 / 3,
      recall: 2 / 3,
      fmeasure: 2 / 3,
    });
  });

  it("scores multiple n-gram rouge types in one pass", () => {
    const scorer = new RougeScorer(["rouge1", "rouge2"]);

    const scores = scorer.score("testing one two", "testing one");

    expect(scores).toEqual({
      rouge1: {
        precision: 1,
        recall: 2 / 3,
        fmeasure: 0.8,
      },
      rouge2: {
        precision: 1,
        recall: 1 / 2,
        fmeasure: 2 / 3,
      },
    });
  });

  it("scores rougeL with consecutive longest common subsequence", () => {
    const scorer = new RougeScorer(["rougeL"]);

    const scores = scorer.score("testing one two", "testing one");

    expect(scores.rougeL).toEqual({
      precision: 1,
      recall: 2 / 3,
      fmeasure: 0.8,
    });
  });

  it("scores rougeL with non-consecutive longest common subsequence", () => {
    const scorer = new RougeScorer(["rougeL"]);

    const scores = scorer.score("testing one two", "testing two");

    expect(scores.rougeL).toEqual({
      precision: 1,
      recall: 2 / 3,
      fmeasure: 0.8,
    });
  });

  it("scores rougeL using token order", () => {
    const scorer = new RougeScorer(["rougeL"]);

    const scores = scorer.score("the cat sat", "sat cat the");

    expect(scores.rougeL).toEqual({
      precision: 1 / 3,
      recall: 1 / 3,
      fmeasure: 1 / 3,
    });
  });

  it("scoreMulti selects the reference with the highest f-measure per rouge type", () => {
    const scorer = new RougeScorer(["rouge1", "rouge2", "rougeL"]);

    const scores = scorer.scoreMulti(
      ["first text", "first something"],
      "text first"
    );

    expect(scores.rouge1.fmeasure).toBe(1);
    expect(scores.rouge2.fmeasure).toBe(0);
    expect(scores.rougeL.fmeasure).toBe(0.5);
  });

  it("scoreMulti rejects an empty reference list", () => {
    const scorer = new RougeScorer(["rouge1"]);

    expect(() => scorer.scoreMulti([], "candidate")).toThrow(
      "scoreMulti requires at least one reference"
    );
  });
});

import { describe, expect, it } from "vitest";
import { RougeScorer } from "../src/index.js";
import type { Tokenizer } from "../src/index.js";

class MapTokenizer implements Tokenizer {
  public constructor(private readonly tokensByText: Record<string, string[]>) {}

  public tokenize(text: string): string[] {
    return this.tokensByText[text] ?? [];
  }
}

describe("custom tokenizers", () => {
  it("scores using custom tokenizer output", () => {
    const scorer = new RougeScorer(["rouge1"], {
      tokenizer: new MapTokenizer({
        "ignored reference": ["a", "b"],
        "ignored candidate": ["a"],
      }),
    });

    const scores = scorer.score("ignored reference", "ignored candidate");

    expect(scores.rouge1).toEqual({
      precision: 1,
      recall: 1 / 2,
      fmeasure: 2 / 3,
    });
  });

  it("uses custom tokenizer output for scoreMulti", () => {
    const scorer = new RougeScorer(["rouge1"], {
      tokenizer: new MapTokenizer({
        "bad reference": ["b"],
        "good reference": ["a"],
        candidate: ["a"],
      }),
    });

    const scores = scorer.scoreMulti(
      ["bad reference", "good reference"],
      "candidate"
    );

    expect(scores.rouge1).toEqual({
      precision: 1,
      recall: 1,
      fmeasure: 1,
    });
  });

  it("allows domain-specific token equivalence", () => {
    const scorer = new RougeScorer(["rouge1"], {
      tokenizer: new MapTokenizer({
        "New York": ["new-york"],
        NYC: ["new-york"],
      }),
    });

    const scores = scorer.score("New York", "NYC");

    expect(scores.rouge1).toEqual({
      precision: 1,
      recall: 1,
      fmeasure: 1,
    });
  });
});

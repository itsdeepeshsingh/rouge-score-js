import { describe, expect, it } from "vitest";
import { RougeScorer } from "../src/index.js";
import { googleParityCases } from "./fixtures/google-parity.js";

describe("Google rouge-score parity", () => {
  it.each(googleParityCases)(
    "matches Google's Python example for $name",
    ({ rougeType, reference, candidate, expected }) => {
      const scorer = new RougeScorer([rougeType]);

      const scores = scorer.score(reference, candidate);
      const score = scores[rougeType];

      expect(score.precision).toBeCloseTo(expected.precision, 12);
      expect(score.recall).toBeCloseTo(expected.recall, 12);
      expect(score.fmeasure).toBeCloseTo(expected.fmeasure, 12);
    }
  );
});

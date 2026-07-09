import type { RougeType, Score } from "../../src/index.js";

export interface GoogleParityCase {
  name: string;
  rougeType: RougeType;
  reference: string;
  candidate: string;
  expected: Score;
}

export const googleParityCases = [
  {
    name: "rouge1",
    rougeType: "rouge1",
    reference: "testing one two",
    candidate: "testing",
    expected: {
      precision: 1,
      recall: 1 / 3,
      fmeasure: 1 / 2,
    },
  },
  {
    name: "rouge2",
    rougeType: "rouge2",
    reference: "testing one two",
    candidate: "testing one",
    expected: {
      precision: 1,
      recall: 1 / 2,
      fmeasure: 2 / 3,
    },
  },
  {
    name: "rougeL consecutive",
    rougeType: "rougeL",
    reference: "testing one two",
    candidate: "testing one",
    expected: {
      precision: 1,
      recall: 2 / 3,
      fmeasure: 4 / 5,
    },
  },
  {
    name: "rougeL non-consecutive",
    rougeType: "rougeL",
    reference: "testing one two",
    candidate: "testing two",
    expected: {
      precision: 1,
      recall: 2 / 3,
      fmeasure: 4 / 5,
    },
  },
] satisfies GoogleParityCase[];

import { createNgrams, scoreLcs, scoreNgrams } from "./scoring.js";
import type { Score, ScoreByRougeType } from "./scoring.js";
import { DefaultTokenizer } from "./tokenizers.js";
import type { Tokenizer } from "./tokenizers.js";

export type RougeType = "rouge1" | "rouge2" | "rougeL";

export interface RougeScorerOptions {
  tokenizer?: Tokenizer;
}

export class RougeScorer<const T extends readonly RougeType[]> {
  private readonly tokenizer: Tokenizer;

  public constructor(
    private readonly rougeTypes: T,
    options: RougeScorerOptions = {}
  ) {
    this.tokenizer = options.tokenizer ?? new DefaultTokenizer();
  }

  public score(
    reference: string,
    candidate: string
  ): ScoreByRougeType<T[number]> {
    const referenceTokens = this.tokenizer.tokenize(reference);
    const candidateTokens = this.tokenizer.tokenize(candidate);
    const scores: Partial<Record<RougeType, Score>> = {};

    for (const rougeType of this.rougeTypes) {
      const ngramSize = ngramSizeForRougeType(rougeType);

      if (ngramSize !== undefined) {
        scores[rougeType] = scoreNgrams(
          createNgrams(referenceTokens, ngramSize),
          createNgrams(candidateTokens, ngramSize)
        );
        continue;
      }

      if (rougeType === "rougeL") {
        scores[rougeType] = scoreLcs(referenceTokens, candidateTokens);
        continue;
      }

      throw new Error(`Unsupported rouge type: ${rougeType}`);
    }

    return scores as ScoreByRougeType<T[number]>;
  }

  public scoreMulti(
    references: readonly string[],
    candidate: string
  ): ScoreByRougeType<T[number]> {
    if (references.length === 0) {
      throw new Error("scoreMulti requires at least one reference");
    }

    const scoresByReference = references.map((reference) =>
      this.score(reference, candidate)
    );
    const bestScores: Partial<Record<RougeType, Score>> = {};

    for (const rougeType of this.rougeTypes) {
      let bestScore: Score | undefined;

      for (const scores of scoresByReference) {
        const score = scores[rougeType as T[number]];

        if (bestScore === undefined || score.fmeasure > bestScore.fmeasure) {
          bestScore = score;
        }
      }

      if (bestScore === undefined) {
        throw new Error(`Unable to score rouge type: ${rougeType}`);
      }

      bestScores[rougeType] = bestScore;
    }

    return bestScores as ScoreByRougeType<T[number]>;
  }
}

function ngramSizeForRougeType(rougeType: RougeType): number | undefined {
  if (rougeType === "rouge1") {
    return 1;
  }

  if (rougeType === "rouge2") {
    return 2;
  }

  return undefined;
}

import { createNgrams, scoreNgrams } from "./scoring.js";
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

      throw new Error(`Unsupported rouge type: ${rougeType}`);
    }

    return scores as ScoreByRougeType<T[number]>;
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

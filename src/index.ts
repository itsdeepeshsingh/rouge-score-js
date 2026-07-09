export type RougeType = "rouge1" | "rouge2" | "rougeL";

export interface Score {
  precision: number;
  recall: number;
  fmeasure: number;
}

export type ScoreByRougeType<T extends RougeType = RougeType> = Record<
  T,
  Score
>;

export interface Tokenizer {
  tokenize(text: string): string[];
}

export class DefaultTokenizer implements Tokenizer {
  public tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((token) => /^[a-z0-9]+$/.test(token));
  }
}

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
      if (rougeType === "rouge1") {
        scores[rougeType] = scoreNgrams(
          createNgrams(referenceTokens, 1),
          createNgrams(candidateTokens, 1)
        );
        continue;
      }

      throw new Error(`Unsupported rouge type: ${rougeType}`);
    }

    return scores as ScoreByRougeType<T[number]>;
  }
}

function createNgrams(tokens: string[], n: number): Map<string, number> {
  const ngrams = new Map<string, number>();

  for (let index = 0; index <= tokens.length - n; index += 1) {
    const ngram = tokens.slice(index, index + n).join("\u0000");
    ngrams.set(ngram, (ngrams.get(ngram) ?? 0) + 1);
  }

  return ngrams;
}

function scoreNgrams(
  referenceNgrams: Map<string, number>,
  candidateNgrams: Map<string, number>
): Score {
  if (referenceNgrams.size === 0 || candidateNgrams.size === 0) {
    return { precision: 0, recall: 0, fmeasure: 0 };
  }

  let overlapCount = 0;
  let referenceCount = 0;
  let candidateCount = 0;

  for (const count of referenceNgrams.values()) {
    referenceCount += count;
  }

  for (const [ngram, candidateNgramCount] of candidateNgrams) {
    candidateCount += candidateNgramCount;
    overlapCount += Math.min(
      candidateNgramCount,
      referenceNgrams.get(ngram) ?? 0
    );
  }

  const precision = overlapCount / candidateCount;
  const recall = overlapCount / referenceCount;

  return {
    precision,
    recall,
    fmeasure: fmeasure(precision, recall),
  };
}

function fmeasure(precision: number, recall: number): number {
  if (precision + recall === 0) {
    return 0;
  }

  return (2 * precision * recall) / (precision + recall);
}

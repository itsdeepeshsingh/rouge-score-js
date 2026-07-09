export interface Score {
  precision: number;
  recall: number;
  fmeasure: number;
}

export type ScoreByRougeType<T extends string> = Record<T, Score>;

export function createNgrams(tokens: string[], n: number): Map<string, number> {
  const ngrams = new Map<string, number>();

  for (let index = 0; index <= tokens.length - n; index += 1) {
    const ngram = tokens.slice(index, index + n).join("\u0000");
    ngrams.set(ngram, (ngrams.get(ngram) ?? 0) + 1);
  }

  return ngrams;
}

export function scoreNgrams(
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

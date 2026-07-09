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

export function scoreLcs(
  referenceTokens: string[],
  candidateTokens: string[]
): Score {
  if (referenceTokens.length === 0 || candidateTokens.length === 0) {
    return { precision: 0, recall: 0, fmeasure: 0 };
  }

  const lcsTable = createLcsTable(referenceTokens, candidateTokens);
  const lcsLength = lcsTable[referenceTokens.length]?.[candidateTokens.length];

  if (lcsLength === undefined) {
    throw new Error("Unable to read LCS table result");
  }

  const precision = lcsLength / candidateTokens.length;
  const recall = lcsLength / referenceTokens.length;

  return {
    precision,
    recall,
    fmeasure: fmeasure(precision, recall),
  };
}

function createLcsTable(referenceTokens: string[], candidateTokens: string[]) {
  const rowCount = referenceTokens.length;
  const columnCount = candidateTokens.length;
  const table = Array.from({ length: rowCount + 1 }, () =>
    Array.from({ length: columnCount + 1 }, () => 0)
  );

  for (let row = 1; row <= rowCount; row += 1) {
    const currentRow = table[row];
    const previousRow = table[row - 1];

    if (currentRow === undefined || previousRow === undefined) {
      throw new Error("Unable to read LCS table row");
    }

    for (let column = 1; column <= columnCount; column += 1) {
      if (referenceTokens[row - 1] === candidateTokens[column - 1]) {
        const previousDiagonalValue = previousRow[column - 1];

        if (previousDiagonalValue === undefined) {
          throw new Error("Unable to read LCS table diagonal");
        }

        currentRow[column] = previousDiagonalValue + 1;
      } else {
        const previousRowValue = previousRow[column];
        const previousColumnValue = currentRow[column - 1];

        if (
          previousRowValue === undefined ||
          previousColumnValue === undefined
        ) {
          throw new Error("Unable to read LCS table neighbor");
        }

        currentRow[column] = Math.max(previousRowValue, previousColumnValue);
      }
    }
  }

  return table;
}

function fmeasure(precision: number, recall: number): number {
  if (precision + recall === 0) {
    return 0;
  }

  return (2 * precision * recall) / (precision + recall);
}

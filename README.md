# rouge-score-js

rouge-score-js is an independent TypeScript implementation of the ROUGE evaluation metrics for text summarization. It is inspired by Google's Python rouge-score library but is not affiliated with or endorsed by Google.

## Status

This package is in early development.

Currently implemented:

- `rouge1`
- strict TypeScript types
- Google-compatible default tokenization without stemming
- ESM and CommonJS build outputs

Planned:

- `rouge2`
- `rougeL`
- stemming support
- additional compatibility tests against Google's Python implementation

## Installation

This package has not been published to npm yet. Once published, it will be installable with:

```sh
npm install rouge-score-js
```

## Usage

```ts
import { RougeScorer } from "rouge-score-js";

const scorer = new RougeScorer(["rouge1"]);
const scores = scorer.score("the cat sat", "the cat");

console.log(scores.rouge1);
// { precision: 1, recall: 0.6666666666666666, fmeasure: 0.8 }
```

The scorer uses `reference` and `candidate` inputs:

```ts
scorer.score(reference, candidate);
```

Scores are returned in an object keyed by ROUGE type, matching the shape of Google's Python implementation while using TypeScript-native types.

## Development

Requires Node.js 18 or newer.

```sh
npm install
npm run check
npm run build
```

`npm run check` runs TypeScript, ESLint, Prettier, and Vitest.

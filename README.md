# rouge-score-js

rouge-score-js is an independent TypeScript implementation of ROUGE evaluation
metrics for text summarization. It is inspired by Google's Python
`rouge-score` package but is not affiliated with or endorsed by Google.

## Status

This package is in early development.

Currently implemented:

- `rouge1`
- `rouge2`
- `rougeL`
- `scoreMulti`
- strict TypeScript types
- Google-compatible default tokenization without stemming
- ESM and CommonJS build outputs
- browser-bundler-compatible ESM output

Planned:

- stemming support
- additional long-text compatibility fixtures against Google's Python
  implementation

## Installation

This package has not been published to npm yet. Once published, it will be
installable with:

```sh
npm install rouge-score-js
```

## Quick Start

```ts
import { RougeScorer } from "rouge-score-js";

const scorer = new RougeScorer(["rouge1", "rouge2", "rougeL"]);
const scores = scorer.score("the cat sat", "the cat");

console.log(scores.rouge1);
// { precision: 1, recall: 0.6666666666666666, fmeasure: 0.8 }
```

The scorer uses `reference` and `candidate` inputs:

```ts
scorer.score(reference, candidate);
```

Scores are returned in an object keyed by ROUGE type, matching the shape of
Google's Python implementation while using TypeScript-native types.

```ts
const scores = scorer.score("testing one two", "testing one");

scores.rouge1.fmeasure; // 0.8
scores.rouge2.fmeasure; // 0.6666666666666666
scores.rougeL.fmeasure; // 0.8
```

## API

### `RougeScorer`

```ts
import { RougeScorer } from "rouge-score-js";

const scorer = new RougeScorer(["rouge1", "rouge2", "rougeL"]);
```

Supported ROUGE types:

- `rouge1`
- `rouge2`
- `rougeL`

### `score(reference, candidate)`

Scores one candidate against one reference.

```ts
const scores = scorer.score("the cat sat", "the cat");
```

Each score contains:

```ts
interface Score {
  precision: number;
  recall: number;
  fmeasure: number;
}
```

### `scoreMulti(references, candidate)`

For multiple references, `scoreMulti` returns the score with the highest
F-measure for each requested ROUGE type:

```ts
const scorer = new RougeScorer(["rouge1", "rougeL"]);
const scores = scorer.scoreMulti(["the cat sat", "the cat slept"], "the cat");
```

This mirrors Google Python `rouge-score` behavior: each reference is scored, and
the best score is selected independently per ROUGE type.

### Custom Tokenizer

The default tokenizer follows Google's normalization strategy:

- lowercase text
- replace non-`a-z0-9` characters with spaces
- split on whitespace
- drop empty or invalid tokens

You can provide a custom tokenizer:

```ts
import { RougeScorer } from "rouge-score-js";
import type { Tokenizer } from "rouge-score-js";

const tokenizer: Tokenizer = {
  tokenize(text) {
    if (text === "NYC") {
      return ["new-york"];
    }

    return text.toLowerCase().split(/\s+/);
  },
};

const scorer = new RougeScorer(["rouge1"], { tokenizer });
const scores = scorer.score("New York", "NYC");
```

## Compatibility

This package aims for algorithmic compatibility with Google's Python
`rouge-score` implementation while exposing an idiomatic TypeScript API.

Compatibility choices made so far:

- `RougeScorer` class API
- result objects keyed by ROUGE type
- `precision`, `recall`, and `fmeasure` score fields
- Google-style default tokenization
- full dynamic-programming table for `rougeL`
- `scoreMulti` selects the highest F-measure per ROUGE type

## Limitations

- Stemming is not implemented yet. This is intentional for now to avoid adding a
  dependency before we validate the best Porter/NLTK-compatible approach.
- `rougeLsum` is not implemented.
- `rougeS` skip-bigram scoring is not implemented.
- The default tokenizer is ASCII-oriented by design, matching Google's
  `[^a-z0-9]+` normalization behavior.
- Long-text parity fixtures from Google's test data are not included yet because
  the local source archive used for development does not include the referenced
  `testdata` files.

## Development

Requires Node.js 18 or newer.

```sh
npm install
npm run check
npm run build
npm run pack:check
```

`npm run check` runs TypeScript, ESLint, Prettier, and Vitest.

`npm run pack:check` performs an npm tarball dry run. The package is expected to
ship only `dist`, `README.md`, `LICENSE`, and `package.json`.

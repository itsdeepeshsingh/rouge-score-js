export interface Tokenizer {
  tokenize(text: string): string[];
}

export class DefaultTokenizer implements Tokenizer {
  public tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((token) => /^[a-z0-9]+$/.test(token));
  }
}

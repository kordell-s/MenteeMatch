import { stopwords } from "./stopwords";

/**
 * Cleaning and tokenizing text by:
 * - Converting to lowercase
 * - Removing punctuation
 * - Splitting by whitespace
 * - Filtering out stopwords
 */
export function preprocess(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // remove punctuation
    .split(/\s+/) // split into words
    .filter((word) => word && !stopwords.includes(word)); // remove empty & stopwords
}

/**
 * Building a global vocabulary of unique words across all documents.
 */
export function buildVocabulary(documents: string[][]): string[] {
  const vocabSet = new Set<string>();
  documents.forEach((tokens) => {
    tokens.forEach((token) => vocabSet.add(token));
  });
  return Array.from(vocabSet);
}

/**
 * Converting a list of tokens into a vector (array of word frequencies),
 * using the vocabulary as a reference for word positions.
 */
export function vectorize(tokens: string[], vocab: string[]): number[] {
  return vocab.map((word) =>
    tokens.filter((t) => t === word).length
  );
}

/**
 * Computes cosine similarity between two vectors:
 * - Dot product of vectors divided by product of magnitudes
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  // Avoid division by zero
  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

import { normalize } from './metrics.js';

export const EMBEDDING_DIMS = 256;
export const EMBEDDING_PROVIDER = 'hash-256';

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'is', 'are', 'was', 'were',
  'be', 'been', 'it', 'its', 'this', 'that', 'these', 'those', 'as', 'at', 'by', 'from', 'into',
  'than', 'then', 'so', 'not', 'no', 'can', 'could', 'should', 'would', 'will', 'may', 'might',
  'do', 'does', 'did', 'has', 'have', 'had', 'but', 'if', 'when', 'where', 'which', 'who', 'what'
]);

export function tokenize(text) {
  return (String(text).toLowerCase().match(/[a-z0-9]+/g) || []).filter(
    (token) => token.length > 1 && !STOPWORDS.has(token)
  );
}

function hashToken(token) {
  let hash = 2166136261;
  for (let i = 0; i < token.length; i += 1) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function embedText(text, dims = EMBEDDING_DIMS) {
  const tokens = tokenize(text);
  const vector = new Array(dims).fill(0);

  const add = (feature, weight) => {
    const hash = hashToken(feature);
    const index = hash % dims;
    const sign = (hash >>> 16) & 1 ? 1 : -1;
    vector[index] += sign * weight;
  };

  tokens.forEach((token) => add(token, 1));
  for (let i = 0; i < tokens.length - 1; i += 1) {
    add(`${tokens[i]}_${tokens[i + 1]}`, 0.55);
  }

  return normalize(vector);
}

export function embedDemoText(text) {
  return embedText(text, 16);
}

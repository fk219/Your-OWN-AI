import { describe, expect, it } from 'vitest';
import { DEMO_VECTORS } from '../src/data.js';
import { embedText, EMBEDDING_DIMS } from '../src/embedding.js';
import { bruteSearch } from '../src/algorithms/brute.js';
import { KDTree } from '../src/algorithms/kdtree.js';
import { HnswIndex } from '../src/algorithms/hnsw.js';
import { project2D } from '../src/projection.js';

const items = DEMO_VECTORS.map((item, index) => ({ id: `v${index}`, vector: item.vector }));
const exactRecall = (algorithmResults, exact, k) => {
  let matches = 0;
  algorithmResults.forEach((ids, index) => {
    ids.forEach((id) => {
      if (exact[index].slice(0, k).includes(id)) matches += 1;
    });
  });
  return matches / (algorithmResults.length * k);
};

const seededRandom = () => {
  let state = 42;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

describe('vector algorithms', () => {
  it('normalizes hash embeddings', () => {
    const a = embedText('vector search and retrieval');
    const b = embedText('vector search and retrieval');
    expect(a).toHaveLength(EMBEDDING_DIMS);
    expect(a).toEqual(b);
    const length = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
    expect(length).toBeCloseTo(1, 5);
  });

  it('keeps KD-tree recall high for the 16D demo vectors', () => {
    const k = 5;
    const exact = items.map((item) => bruteSearch(items, item.vector, k, 'cosine').map((r) => r.id));
    const tree = new KDTree(items, 'cosine');
    const actual = items.map((item) => tree.search(item.vector, k).map((r) => r.id));
    expect(exactRecall(actual, exact, k)).toBeGreaterThan(0.98);
  });

  it('returns usable HNSW results and reports its graph', () => {
    const k = 5;
    const exact = items.map((item) => bruteSearch(items, item.vector, k, 'cosine').map((r) => r.id));
    const hnsw = new HnswIndex({ metric: 'cosine', M: 8, efConstruction: 64, random: seededRandom() });
    items.forEach((item) => hnsw.insert(item.id, item.vector));
    const actual = items.map((item) => hnsw.search(item.vector, k, 96).map((r) => r.id));
    const recall = exactRecall(actual, exact, k);
    expect(recall).toBeGreaterThan(0.5);
    expect(hnsw.stats.nodes).toBe(items.length);
    expect(hnsw.stats.links).toBeGreaterThan(0);
  });

  it('projects demo vectors into a bounded 2D field', () => {
    const points = project2D(items.map((item) => item.vector));
    expect(points).toHaveLength(items.length);
    for (const point of points) {
      expect(Math.abs(point.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(point.y)).toBeLessThanOrEqual(1);
    }
  });
});

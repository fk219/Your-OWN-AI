import { performance } from 'node:perf_hooks';
import { DemoVector, Document } from './models.js';
import { distance, METRICS } from './metrics.js';
import { embedText, tokenize, EMBEDDING_DIMS, EMBEDDING_PROVIDER } from './embedding.js';
import { project2D } from './projection.js';
import { HnswIndex } from './algorithms/hnsw.js';
import { KDTree } from './algorithms/kdtree.js';
import { bruteSearch } from './algorithms/brute.js';

const ALGORITHMS = ['hnsw', 'kdtree', 'brute'];
const ALGORITHM_LABELS = { hnsw: 'HNSW', kdtree: 'KD-tree', brute: 'Brute force' };

const stripEmbedding = (doc) => ({
  id: doc._id.toString(),
  title: doc.title,
  text: doc.text,
  tags: doc.tags,
  category: doc.category,
  dims: doc.dims,
  provider: doc.provider,
  createdAt: doc.createdAt
});

const overlap = (left, right) => {
  let count = 0;
  for (const id of left) if (right.includes(id)) count += 1;
  return count;
};

export class SearchEngine {
  constructor() {
    this.demoItems = [];
    this.demoById = new Map();
    this.documents = [];
    this.docById = new Map();
    this.indexes = {};
    this.docIndex = null;
    this.builtAt = null;
  }

  async rebuild() {
    const demoDocs = await DemoVector.find({}).lean();
    const docs = await Document.find({}).lean();
    this.demoItems = demoDocs.map((doc) => ({
      id: doc._id.toString(),
      label: doc.label,
      category: doc.category,
      vector: doc.vector
    }));
    this.demoById = new Map(this.demoItems.map((item) => [item.id, item]));
    this.documents = docs;
    this.docById = new Map(docs.map((doc) => [doc._id.toString(), doc]));

    this.indexes = {};
    for (const metric of METRICS) {
      const hnsw = new HnswIndex({ metric, M: 8, efConstruction: 64 });
      this.demoItems.forEach((item) => hnsw.insert(item.id, item.vector));
      this.indexes[metric] = {
        hnsw,
        kdtree: new KDTree(this.demoItems, metric)
      };
    }

    this.docIndex = new HnswIndex({ metric: 'cosine', M: 8, efConstruction: 64 });
    this.documents.forEach((doc) => this.docIndex.insert(doc._id.toString(), doc.embedding));
    this.builtAt = new Date();
    return this;
  }

  demoPayload() {
    const projection = project2D(this.demoItems.map((item) => item.vector));
    return {
      vectors: this.demoItems.map((item, index) => ({
        ...item,
        x: projection[index]?.x ?? 0,
        y: projection[index]?.y ?? 0
      })),
      categories: Array.from(new Set(this.demoItems.map((item) => item.category))),
      stats: this.stats()
    };
  }

  searchDemo({ vector, k = 5, metric = 'cosine', algorithm = 'hnsw' }) {
    if (!Array.isArray(vector) || vector.length !== 16 || vector.some((value) => !Number.isFinite(Number(value)))) {
      throw new Error('Provide a 16-dimensional numeric demo vector');
    }
    if (!METRICS.includes(metric)) throw new Error('Unknown metric');
    if (!ALGORITHMS.includes(algorithm)) throw new Error('Unknown algorithm');

    const query = vector.map(Number);
    const started = performance.now();
    let raw;
    if (algorithm === 'hnsw') raw = this.indexes[metric].hnsw.search(query, k, 64);
    else if (algorithm === 'kdtree') raw = this.indexes[metric].kdtree.search(query, k);
    else raw = bruteSearch(this.demoItems, query, k, metric);
    const latencyMs = performance.now() - started;

    return {
      algorithm,
      algorithmLabel: ALGORITHM_LABELS[algorithm],
      metric,
      k,
      latencyMs,
      results: raw.map((result, index) => ({
        rank: index + 1,
        ...this.demoById.get(result.id),
        distance: result.distance,
        score: metric === 'cosine' ? Math.max(0, 1 - result.distance) : 1 / (1 + result.distance)
      }))
    };
  }

  benchmark({ metric = 'cosine', k = 5 } = {}) {
    if (!METRICS.includes(metric)) throw new Error('Unknown metric');
    const queries = this.demoItems.map((item) => item.vector);
    const exact = queries.map((query) =>
      bruteSearch(this.demoItems, query, k, metric).map((result) => result.id)
    );

    const algorithms = ALGORITHMS.map((algorithm) => {
      let matches = 0;
      const started = performance.now();
      for (let i = 0; i < queries.length; i += 1) {
        let raw;
        if (algorithm === 'hnsw') raw = this.indexes[metric].hnsw.search(queries[i], k, 96);
        else if (algorithm === 'kdtree') raw = this.indexes[metric].kdtree.search(queries[i], k);
        else raw = bruteSearch(this.demoItems, queries[i], k, metric);
        matches += overlap(exact[i], raw.map((result) => result.id));
      }
      const totalMs = performance.now() - started;
      return {
        name: algorithm,
        label: ALGORITHM_LABELS[algorithm],
        totalMs,
        avgMs: totalMs / queries.length,
        recall: matches / (queries.length * k)
      };
    });

    return { metric, k, queries: queries.length, algorithms };
  }

  searchDocuments(embedding, k = 4) {
    const started = performance.now();
    const raw = this.docIndex.search(embedding, k, 96);
    const retrievalMs = performance.now() - started;
    return {
      retrievalMs,
      sources: raw
        .map((result) => {
          const doc = this.docById.get(result.id);
          return doc
            ? {
                ...stripEmbedding(doc),
                distance: result.distance,
                score: Math.max(0, 1 - result.distance)
              }
            : null;
        })
        .filter(Boolean)
    };
  }

  async listDocuments() {
    const docs = await Document.find({}).sort({ createdAt: -1 }).lean();
    return docs.map(stripEmbedding);
  }

  async addDocument({ title, text, tags = [], category = 'General' }) {
    if (!title || !String(title).trim()) throw new Error('A title is required');
    if (!text || String(text).trim().length < 20) throw new Error('Add at least 20 characters of text');
    const normalizedTags = Array.isArray(tags)
      ? tags.map((tag) => String(tag).trim()).filter(Boolean)
      : String(tags || '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);

    const doc = await Document.create({
      title: String(title).trim(),
      text: String(text).trim(),
      tags: normalizedTags,
      category: String(category || 'General').trim() || 'General',
      embedding: embedText(`${title} ${text} ${normalizedTags.join(' ')}`),
      dims: EMBEDDING_DIMS,
      provider: EMBEDDING_PROVIDER
    });

    await this.rebuild();
    return stripEmbedding(doc);
  }

  async deleteDocument(id) {
    if (!/^[a-f\d]{24}$/i.test(id)) return false;
    const result = await Document.deleteOne({ _id: id });
    if (result.deletedCount) await this.rebuild();
    return result.deletedCount === 1;
  }

  ask(question, k = 4) {
    if (!question || String(question).trim().length < 3) throw new Error('Ask a longer question');
    const started = performance.now();
    const embedding = embedText(question);
    const { sources, retrievalMs } = this.searchDocuments(embedding, k);

    const questionTokens = new Set(tokenize(question));
    const sentences = [];
    for (const source of sources) {
      for (const sentence of source.text.split(/(?<=[.!?])\s+/)) {
        const tokens = tokenize(sentence);
        const score = tokens.reduce((sum, token) => sum + (questionTokens.has(token) ? 1 : 0), 0);
        sentences.push({ sentence: sentence.trim(), score, title: source.title, sourceId: source.id });
      }
    }

    const selected = [];
    const seen = new Set();
    for (const candidate of sentences.sort((a, b) => b.score - a.score)) {
      if (!candidate.sentence || seen.has(candidate.sentence)) continue;
      seen.add(candidate.sentence);
      selected.push(candidate);
      if (selected.length >= 3) break;
    }

    const answer = selected.length
      ? selected.map((entry) => entry.sentence).join(' ')
      : sources[0]?.text || 'No matching passage was found.';

    return {
      question,
      answer,
      mode: 'extractive',
      sources,
      citations: selected.map((entry) => ({ title: entry.title, sourceId: entry.sourceId })),
      timings: {
        retrievalMs,
        totalMs: performance.now() - started
      },
      embedding: { dims: EMBEDDING_DIMS, provider: EMBEDDING_PROVIDER }
    };
  }

  stats() {
    return {
      demoVectors: this.demoItems.length,
      documents: this.documents.length,
      demoDims: this.demoItems[0]?.vector.length || 0,
      documentDims: EMBEDDING_DIMS,
      embeddingProvider: EMBEDDING_PROVIDER,
      algorithms: {
        hnsw: this.indexes.cosine?.hnsw.stats || null,
        kdtree: this.indexes.cosine?.kdtree.stats || null,
        brute: { nodes: this.demoItems.length }
      },
      documentIndex: this.docIndex?.stats || null,
      builtAt: this.builtAt
    };
  }
}

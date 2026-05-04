import { BruteForce } from "../algos/bruteforce.js";
import { HNSW } from "../algos/hnsw.js";
import { KDTree } from "../algos/kdtree.js";
import { cosine, euclidean, manhattan } from "../math/distance.js";
import type { Metric, SearchAlgo, Vector, VectorItem } from "../types.js";
import { DEMO_DIMS, getDemoItems } from "./demoData.js";

function metricFn(metric: Metric) {
  if (metric === "cosine") return cosine;
  if (metric === "manhattan") return manhattan;
  return euclidean;
}

function round(n: number, digits: number) {
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}

function roundVec(v: number[], digits: number) {
  return v.map((x) => round(x, digits));
}

export type Hit = {
  id: number;
  metadata: string;
  category: string;
  distance: number;
  embedding: Vector;
};

export type SearchOut = {
  results: Hit[];
  latencyUs: number;
  algo: string;
  metric: string;
};

export class VectorDB {
  private store = new Map<number, VectorItem>();
  private bf = new BruteForce();
  private kdt: KDTree;
  private hnsw = new HNSW({ m: 16, efBuild: 200, seed: 42 });
  private nextId = 1;

  constructor(public readonly dims: number) {
    this.kdt = new KDTree(dims);
  }

  loadDemo() {
    for (const it of getDemoItems()) {
      this.insert(it.metadata, it.category, it.embedding);
    }
  }

  insert(metadata: string, category: string, embedding: Vector) {
    const id = this.nextId++;
    const v: VectorItem = { id, metadata, category, embedding };
    this.store.set(id, v);

    this.bf.insert({ id, embedding });
    this.kdt.insert({ id, embedding });
    this.hnsw.insert({ id, embedding, metadata, category }, cosine);
    return id;
  }

  remove(id: number) {
    if (!this.store.has(id)) return false;
    this.store.delete(id);
    this.bf.remove(id);
    this.hnsw.remove(id);
    const remaining = Array.from(this.store.values()).map((x) => ({
      id: x.id,
      embedding: x.embedding
    }));
    this.kdt.rebuild(remaining);
    return true;
  }

  all() {
    return Array.from(this.store.values()).map((v) => ({
      id: v.id,
      metadata: v.metadata,
      category: v.category,
      embedding: roundVec(v.embedding, 4)
    }));
  }

  search(q: Vector, k: number, metric: Metric, algo: SearchAlgo): SearchOut {
    const dfn = metricFn(metric);
    const t0 = process.hrtime.bigint();

    let raw: Array<{ id: number; distance: number }> = [];
    if (algo === "bruteforce") raw = this.bf.knn(q, k, dfn);
    else if (algo === "kdtree") raw = this.kdt.knn(q, k, dfn);
    else raw = this.hnsw.knn(q, k, 50, dfn);

    const us = Number((process.hrtime.bigint() - t0) / 1000n);
    const results: Hit[] = [];
    for (const r of raw) {
      const it = this.store.get(r.id);
      if (!it) continue;
      results.push({
        id: it.id,
        metadata: it.metadata,
        category: it.category,
        distance: round(r.distance, 6),
        embedding: roundVec(it.embedding, 4)
      });
    }
    return { results, latencyUs: us, algo, metric };
  }

  benchmark(q: Vector, k: number, metric: Metric) {
    const dfn = metricFn(metric);
    const time = (fn: () => void) => {
      const t0 = process.hrtime.bigint();
      fn();
      return Number((process.hrtime.bigint() - t0) / 1000n);
    };

    return {
      bruteforceUs: time(() => this.bf.knn(q, k, dfn)),
      kdtreeUs: time(() => this.kdt.knn(q, k, dfn)),
      hnswUs: time(() => this.hnsw.knn(q, k, 50, dfn)),
      itemCount: this.store.size
    };
  }

  hnswInfo() {
    return this.hnsw.getInfo();
  }

  stats() {
    return {
      count: this.store.size,
      dims: DEMO_DIMS,
      algorithms: ["bruteforce", "kdtree", "hnsw"],
      metrics: ["euclidean", "cosine", "manhattan"]
    };
  }
}


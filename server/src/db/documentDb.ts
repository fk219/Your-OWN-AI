import { BruteForce } from "../algos/bruteforce.js";
import { HNSW } from "../algos/hnsw.js";
import { cosine } from "../math/distance.js";
import type { Vector } from "../types.js";

export type DocItem = {
  id: number;
  title: string;
  text: string;
  embedding: Vector;
};

export class DocumentDB {
  private store = new Map<number, DocItem>();
  private nextId = 1;
  private dims = 0;
  private hnsw = new HNSW({ m: 16, efBuild: 200, seed: 42 });
  private bf = new BruteForce();

  insert(title: string, text: string, embedding: Vector) {
    if (this.dims === 0) this.dims = embedding.length;
    const id = this.nextId++;
    const item: DocItem = { id, title, text, embedding };
    this.store.set(id, item);
    this.hnsw.insert({ id, embedding, metadata: title, category: "doc" }, cosine);
    this.bf.insert({ id, embedding });
    return id;
  }

  search(q: Vector, k: number, maxDist = 0.7) {
    if (this.store.size === 0) return [];
    const raw =
      this.store.size < 10 ? this.bf.knn(q, k, cosine) : this.hnsw.knn(q, k, 50, cosine);
    return raw
      .map((r) => {
        const it = this.store.get(r.id);
        if (!it) return null;
        return { distance: r.distance, item: it };
      })
      .filter((x): x is { distance: number; item: DocItem } => Boolean(x))
      .filter((x) => x.distance <= maxDist);
  }

  remove(id: number) {
    if (!this.store.has(id)) return false;
    this.store.delete(id);
    this.hnsw.remove(id);
    this.bf.remove(id);
    return true;
  }

  all() {
    return Array.from(this.store.values());
  }

  size() {
    return this.store.size;
  }

  getDims() {
    return this.dims;
  }
}


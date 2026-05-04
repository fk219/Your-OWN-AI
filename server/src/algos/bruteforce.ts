import type { DistFn, Vector } from "../types.js";

type Item = { id: number; embedding: Vector };

export class BruteForce {
  private items: Item[] = [];

  insert(v: Item) {
    this.items.push(v);
  }

  remove(id: number) {
    this.items = this.items.filter((x) => x.id !== id);
  }

  knn(q: Vector, k: number, dist: DistFn) {
    const r = this.items
      .map((v) => ({ id: v.id, distance: dist(q, v.embedding) }))
      .sort((a, b) => a.distance - b.distance);
    return r.slice(0, k);
  }
}


import type { DistFn, Vector } from "../types.js";

type Item = { id: number; embedding: Vector };

type Node = {
  item: Item;
  left: Node | null;
  right: Node | null;
};

export class KDTree {
  private root: Node | null = null;

  constructor(private dims: number) {}

  insert(v: Item) {
    const ins = (n: Node | null, item: Item, depth: number): Node => {
      if (!n) return { item, left: null, right: null };
      const ax = depth % this.dims;
      if (item.embedding[ax] < n.item.embedding[ax]) n.left = ins(n.left, item, depth + 1);
      else n.right = ins(n.right, item, depth + 1);
      return n;
    };
    this.root = ins(this.root, v, 0);
  }

  rebuild(items: Item[]) {
    this.root = null;
    for (const it of items) this.insert(it);
  }

  knn(q: Vector, k: number, dist: DistFn) {
    const heap: Array<{ distance: number; id: number }> = [];

    const push = (x: { distance: number; id: number }) => {
      heap.push(x);
      heap.sort((a, b) => b.distance - a.distance);
      if (heap.length > k) heap.shift();
    };

    const search = (n: Node | null, depth: number) => {
      if (!n) return;

      const dn = dist(q, n.item.embedding);
      if (heap.length < k || dn < heap[0].distance) push({ distance: dn, id: n.item.id });

      const ax = depth % this.dims;
      const diff = q[ax] - n.item.embedding[ax];
      const closer = diff < 0 ? n.left : n.right;
      const farther = diff < 0 ? n.right : n.left;

      search(closer, depth + 1);
      if (heap.length < k || Math.abs(diff) < heap[0].distance) search(farther, depth + 1);
    };

    search(this.root, 0);
    return heap.sort((a, b) => a.distance - b.distance);
  }
}

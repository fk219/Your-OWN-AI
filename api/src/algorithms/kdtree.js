import { distance, euclideanDistance, normalize } from '../metrics.js';

export class KDTree {
  constructor(items, metric = 'cosine') {
    this.metric = metric;
    this.normalized = metric === 'cosine';
    this.dim = items[0]?.vector.length || 0;
    this.items = items.map((item) => ({
      ...item,
      searchVector: this.normalized ? normalize(item.vector) : item.vector
    }));
    this.root = this.build([...this.items], 0);
  }

  build(items, depth) {
    if (!items.length) return null;
    const axis = depth % this.dim;
    items.sort((a, b) => a.searchVector[axis] - b.searchVector[axis]);
    const mid = Math.floor(items.length / 2);
    return {
      item: items[mid],
      axis,
      left: this.build(items.slice(0, mid), depth + 1),
      right: this.build(items.slice(mid + 1), depth + 1)
    };
  }

  search(query, k = 5) {
    if (!this.root) return [];
    const original = query;
    const q = this.normalized ? normalize(query) : query;
    const best = [];
    this.visit(this.root, q, k, best);

    return best
      .map((entry) => ({
        id: entry.item.id,
        distance:
          this.metric === 'cosine'
            ? distance(entry.item.vector, original, 'cosine')
            : entry.distance
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
  }

  visit(node, query, k, best) {
    if (!node) return;

    const d = this.normalized
      ? euclideanDistance(query, node.item.searchVector)
      : distance(query, node.item.searchVector, this.metric);

    if (best.length < k || d < best[best.length - 1].distance) {
      best.push({ item: node.item, distance: d });
      best.sort((a, b) => a.distance - b.distance);
      if (best.length > k) best.pop();
    }

    const diff = query[node.axis] - node.item.searchVector[node.axis];
    const near = diff < 0 ? node.left : node.right;
    const far = diff < 0 ? node.right : node.left;

    this.visit(near, query, k, best);
    if (best.length < k || Math.abs(diff) < best[best.length - 1].distance) {
      this.visit(far, query, k, best);
    }
  }

  get stats() {
    const count = (node) => (node ? 1 + count(node.left) + count(node.right) : 0);
    return { nodes: count(this.root), dims: this.dim, mode: this.normalized ? 'normalized' : 'raw' };
  }
}

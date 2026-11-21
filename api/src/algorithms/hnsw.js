import { distance } from '../metrics.js';

export class HnswIndex {
  constructor({ metric = 'cosine', M = 8, efConstruction = 64, random = Math.random } = {}) {
    this.metric = metric;
    this.M = M;
    this.efConstruction = efConstruction;
    this.random = random;
    this.nodes = new Map();
    this.entry = null;
    this.maxLevel = -1;
  }

  randomLevel() {
    return Math.floor(-Math.log(Math.max(this.random(), 1e-9)) / Math.log(this.M));
  }

  insert(id, vector) {
    const level = this.randomLevel();
    const node = {
      id,
      vector,
      level,
      neighbors: Array.from({ length: level + 1 }, () => [])
    };

    if (!this.entry) {
      this.nodes.set(id, node);
      this.entry = node;
      this.maxLevel = level;
      return;
    }

    this.nodes.set(id, node);
    let current = this.entry;
    for (let l = this.maxLevel; l > level; l -= 1) {
      current = this.greedy(current, vector, l);
    }

    for (let l = Math.min(level, this.maxLevel); l >= 0; l -= 1) {
      const candidates = this.searchLayer(vector, this.efConstruction, l, [current]);
      const selected = candidates.slice(0, this.M);
      node.neighbors[l] = selected.map((candidate) => candidate.node.id);

      for (const candidate of selected) {
        const links = candidate.node.neighbors[l] || (candidate.node.neighbors[l] = []);
        links.push(node.id);
        if (links.length > this.M) {
          links.sort(
            (a, b) =>
              distance(this.nodes.get(a).vector, candidate.node.vector, this.metric) -
              distance(this.nodes.get(b).vector, candidate.node.vector, this.metric)
          );
          links.length = this.M;
        }
      }

      if (candidates[0]) current = candidates[0].node;
    }

    if (level > this.maxLevel) {
      this.maxLevel = level;
      this.entry = node;
    }
  }

  greedy(start, query, level) {
    let current = start;
    let changed = true;
    while (changed) {
      changed = false;
      for (const id of current.neighbors[level] || []) {
        const neighbor = this.nodes.get(id);
        if (!neighbor || neighbor.level < level) continue;
        if (distance(neighbor.vector, query, this.metric) < distance(current.vector, query, this.metric)) {
          current = neighbor;
          changed = true;
        }
      }
    }
    return current;
  }

  searchLayer(query, ef, level, entryPoints) {
    const visited = new Set();
    const candidates = [];
    const results = [];

    const add = (node) => {
      if (!node || node.level < level || visited.has(node.id)) return;
      visited.add(node.id);
      const entry = { node, dist: distance(node.vector, query, this.metric) };
      candidates.push(entry);
      results.push(entry);
    };

    entryPoints.forEach(add);

    const worst = () => (results.length ? Math.max(...results.map((result) => result.dist)) : Infinity);

    while (candidates.length) {
      candidates.sort((a, b) => a.dist - b.dist);
      const current = candidates.shift();
      if (results.length >= ef && current.dist > worst()) break;

      for (const id of current.node.neighbors[level] || []) {
        add(this.nodes.get(id));
      }

      results.sort((a, b) => a.dist - b.dist);
      if (results.length > ef) results.length = ef;
    }

    return results.sort((a, b) => a.dist - b.dist);
  }

  search(query, k = 5, efSearch = 64) {
    if (!this.entry) return [];
    let current = this.entry;
    for (let l = this.maxLevel; l > 0; l -= 1) {
      current = this.greedy(current, query, l);
    }
    return this.searchLayer(query, Math.max(efSearch, k), 0, [current])
      .slice(0, k)
      .map((result) => ({ id: result.node.id, distance: result.dist }));
  }

  get stats() {
    const linkCount = Array.from(this.nodes.values()).reduce(
      (sum, node) => sum + node.neighbors.reduce((inner, links) => inner + links.length, 0),
      0
    );
    return {
      nodes: this.nodes.size,
      levels: this.maxLevel + 1,
      links: linkCount,
      M: this.M,
      efConstruction: this.efConstruction
    };
  }
}

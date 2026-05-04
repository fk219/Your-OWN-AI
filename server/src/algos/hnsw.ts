import type { DistFn, Vector } from "../types.js";

export type HnswItem = { id: number; embedding: Vector; metadata?: string; category?: string };

type Node = {
  item: HnswItem;
  maxLyr: number;
  nbrs: number[][];
};

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export class HNSW {
  private G = new Map<number, Node>();
  private topLayer = -1;
  private entryPt = -1;
  private M: number;
  private M0: number;
  private efBuild: number;
  private mL: number;
  private rand: () => number;

  constructor(opts: { m?: number; efBuild?: number; seed?: number } = {}) {
    const m = opts.m ?? 16;
    const efBuild = opts.efBuild ?? 200;
    const seed = opts.seed ?? 42;
    this.M = m;
    this.M0 = 2 * m;
    this.efBuild = efBuild;
    this.mL = 1 / Math.log(m);
    this.rand = mulberry32(seed);
  }

  private randLevel() {
    const u = Math.max(this.rand(), 1e-12);
    return Math.floor(-Math.log(u) * this.mL);
  }

  private searchLayer(q: Vector, ep: number, ef: number, lyr: number, dist: DistFn) {
    const vis = new Set<number>();
    const cands: Array<{ d: number; id: number }> = [];
    const found: Array<{ d: number; id: number }> = [];

    const epNode = this.G.get(ep);
    if (!epNode) return [];
    const d0 = dist(q, epNode.item.embedding);
    vis.add(ep);
    cands.push({ d: d0, id: ep });
    found.push({ d: d0, id: ep });

    const popMin = () => {
      cands.sort((a, b) => a.d - b.d);
      return cands.shift()!;
    };

    const topFound = () => {
      found.sort((a, b) => b.d - a.d);
      return found[0];
    };

    while (cands.length > 0) {
      const { d: cd, id: cid } = popMin();
      if (found.length >= ef && cd > topFound().d) break;

      const cn = this.G.get(cid);
      if (!cn) continue;
      if (lyr >= cn.nbrs.length) continue;

      for (const nid of cn.nbrs[lyr]) {
        if (vis.has(nid)) continue;
        const nn = this.G.get(nid);
        if (!nn) continue;
        vis.add(nid);
        const nd = dist(q, nn.item.embedding);
        if (found.length < ef || nd < topFound().d) {
          cands.push({ d: nd, id: nid });
          found.push({ d: nd, id: nid });
          found.sort((a, b) => a.d - b.d);
          if (found.length > ef) found.pop();
        }
      }
    }

    found.sort((a, b) => a.d - b.d);
    return found;
  }

  private selectNbrs(cands: Array<{ d: number; id: number }>, maxM: number) {
    return cands.slice(0, Math.min(cands.length, maxM)).map((x) => x.id);
  }

  insert(item: HnswItem, dist: DistFn) {
    const id = item.id;
    const lvl = this.randLevel();
    this.G.set(id, { item, maxLyr: lvl, nbrs: Array.from({ length: lvl + 1 }, () => []) });

    if (this.entryPt === -1) {
      this.entryPt = id;
      this.topLayer = lvl;
      return;
    }

    let ep = this.entryPt;
    for (let lc = this.topLayer; lc > lvl; lc--) {
      const epNode = this.G.get(ep);
      if (!epNode) break;
      if (lc < epNode.nbrs.length) {
        const W = this.searchLayer(item.embedding, ep, 1, lc, dist);
        if (W.length > 0) ep = W[0].id;
      }
    }

    for (let lc = Math.min(this.topLayer, lvl); lc >= 0; lc--) {
      const W = this.searchLayer(item.embedding, ep, this.efBuild, lc, dist);
      const maxM = lc === 0 ? this.M0 : this.M;
      const sel = this.selectNbrs(W, maxM);
      const node = this.G.get(id)!;
      node.nbrs[lc] = sel;

      for (const nid of sel) {
        const nNode = this.G.get(nid);
        if (!nNode) continue;
        while (nNode.nbrs.length <= lc) nNode.nbrs.push([]);
        const conn = nNode.nbrs[lc];
        conn.push(id);
        if (conn.length > maxM) {
          const ds = conn
            .map((c) => {
              const cNode = this.G.get(c);
              if (!cNode) return null;
              return { d: dist(nNode.item.embedding, cNode.item.embedding), id: c };
            })
            .filter((x): x is { d: number; id: number } => Boolean(x))
            .sort((a, b) => a.d - b.d)
            .slice(0, maxM)
            .map((x) => x.id);
          nNode.nbrs[lc] = ds;
        }
      }

      if (W.length > 0) ep = W[0].id;
    }

    if (lvl > this.topLayer) {
      this.topLayer = lvl;
      this.entryPt = id;
    }
  }

  knn(q: Vector, k: number, ef: number, dist: DistFn) {
    if (this.entryPt === -1) return [];

    let ep = this.entryPt;
    for (let lc = this.topLayer; lc > 0; lc--) {
      const epNode = this.G.get(ep);
      if (!epNode) break;
      if (lc < epNode.nbrs.length) {
        const W = this.searchLayer(q, ep, 1, lc, dist);
        if (W.length > 0) ep = W[0].id;
      }
    }

    const W = this.searchLayer(q, ep, Math.max(ef, k), 0, dist);
    return W.slice(0, k).map((x) => ({ id: x.id, distance: x.d }));
  }

  remove(id: number) {
    if (!this.G.has(id)) return;
    for (const [, nd] of this.G) {
      for (const layer of nd.nbrs) {
        const idx = layer.indexOf(id);
        if (idx >= 0) layer.splice(idx, 1);
      }
    }
    if (this.entryPt === id) {
      this.entryPt = -1;
      for (const [nid] of this.G) {
        if (nid !== id) {
          this.entryPt = nid;
          break;
        }
      }
    }
    this.G.delete(id);
  }

  getInfo() {
    const maxL = Math.max(this.topLayer + 1, 1);
    const nodesPerLayer = Array.from({ length: maxL }, () => 0);
    const edgesPerLayer = Array.from({ length: maxL }, () => 0);

    const nodes: Array<{ id: number; metadata: string; category: string; maxLyr: number }> = [];
    const edges: Array<{ src: number; dst: number; lyr: number }> = [];

    for (const [id, nd] of this.G) {
      nodes.push({
        id,
        metadata: nd.item.metadata ?? "",
        category: nd.item.category ?? "",
        maxLyr: nd.maxLyr
      });
      for (let lc = 0; lc <= nd.maxLyr && lc < maxL; lc++) {
        nodesPerLayer[lc]++;
        const layer = nd.nbrs[lc] ?? [];
        for (const nid of layer) {
          if (id < nid) {
            edgesPerLayer[lc]++;
            edges.push({ src: id, dst: nid, lyr: lc });
          }
        }
      }
    }

    return {
      topLayer: this.topLayer,
      nodeCount: this.G.size,
      nodesPerLayer,
      edgesPerLayer,
      nodes,
      edges
    };
  }

  size() {
    return this.G.size;
  }
}


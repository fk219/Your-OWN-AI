# VectorDB MERN Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the current C++ VectorDB backend as a Node/Express (TypeScript) backend, preserving the exact REST API contract and all user-visible functionality. (Frontend migration is planned separately once API parity is verified.)

**Architecture:** The backend implements the same in-memory data model and algorithms (Brute Force, KD-Tree, HNSW) plus the same Ollama-backed embedding + RAG pipeline, with deterministic behavior where possible to reduce diffs vs the C++ reference.

**Tech Stack:** Node.js, Express, TypeScript, Vitest, Supertest.

---

## Scope Notes

- The target is **exact REST API parity** with the existing C++ server (endpoints + parameters + response JSON structure).
- The target is **in-memory behavior** (no MongoDB persistence). Data resets on restart, matching today’s repo behavior.
- Ollama remains an external runtime dependency and is not bundled.

---

## File Structure (New)

- Create: `server/`
  - `server/package.json`
  - `server/tsconfig.json`
  - `server/src/app.ts` (Express app)
  - `server/src/index.ts` (HTTP server entrypoint)
  - `server/src/cors.ts` (CORS headers)
  - `server/src/types.ts` (shared types)
  - `server/src/math/distance.ts` (euclidean/cosine/manhattan)
  - `server/src/db/vectorDb.ts` (demo DB: CRUD + search + benchmark)
  - `server/src/db/demoData.ts` (seed demo vectors)
  - `server/src/algos/bruteforce.ts`
  - `server/src/algos/kdtree.ts`
  - `server/src/algos/hnsw.ts`
  - `server/src/ollama/ollamaClient.ts`
  - `server/src/text/chunker.ts`
  - `server/src/db/documentDb.ts`
  - `server/src/routes/demoRoutes.ts`
  - `server/src/routes/docRoutes.ts`
  - `server/src/routes/metaRoutes.ts` (`/status`, `/stats`)
  - `server/test/api.test.ts`
- Create (optional but recommended): `package.json` at repo root for workspaces

---

## Task 1: Initialize Monorepo (npm workspaces)

**Files:**
- Create: `/workspace/package.json`
- Create: `/workspace/.npmrc`

- [ ] **Step 1: Create root workspace config**

```json
{
  "name": "vectordb-mern-rewrite",
  "private": true,
  "workspaces": [
    "server"
  ]
}
```

- [ ] **Step 2: Add npmrc**

```text
fund=false
audit=false
```

- [ ] **Step 3: Create server folder**

Run:

```bash
mkdir -p server
```

- [ ] **Step 4: Commit**

```bash
git add package.json .npmrc server
git commit -m "chore: initialize workspace layout"
```

---

## Task 2: Scaffold Backend (Express + TypeScript + Tests)

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/src/app.ts`
- Create: `server/src/index.ts`
- Create: `server/src/cors.ts`
- Create: `server/test/api.test.ts`

- [ ] **Step 1: Initialize backend package**

Run:

```bash
cd server
npm init -y
```

- [ ] **Step 2: Install runtime dependencies**

Run:

```bash
cd server
npm i express cors
```

- [ ] **Step 3: Install dev dependencies**

Run:

```bash
cd server
npm i -D typescript tsx @types/node @types/express vitest supertest @types/supertest
```

- [ ] **Step 4: Add server scripts**

Update `server/package.json` to include:

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "start": "node dist/index.js",
    "build": "tsc -p tsconfig.json"
  }
}
```

- [ ] **Step 5: Add tsconfig**

Create `server/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src", "test"]
}
```

- [ ] **Step 6: Implement CORS helper compatible with current behavior**

Create `server/src/cors.ts`:

```ts
import type { Response } from "express";

export function applyCors(res: Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
```

- [ ] **Step 7: Implement Express app skeleton**

Create `server/src/app.ts`:

```ts
import express from "express";
import cors from "cors";
import { applyCors } from "./cors.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.options(/.*/, (_req, res) => {
    applyCors(res);
    res.status(204).end();
  });

  app.get("/health", (_req, res) => {
    applyCors(res);
    res.json({ ok: true });
  });

  return app;
}
```

- [ ] **Step 8: Implement HTTP entrypoint**

Create `server/src/index.ts`:

```ts
import { createApp } from "./app.js";

const PORT = Number(process.env.PORT ?? 8080);

const app = createApp();
app.listen(PORT, "0.0.0.0", () => {
  process.stdout.write(`http://localhost:${PORT}\n`);
});
```

- [ ] **Step 9: Add a failing API parity test (sanity)**

Create `server/test/api.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("server", () => {
  it("responds to /health", async () => {
    const app = createApp();
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
```

- [ ] **Step 10: Run tests**

Run:

```bash
cd server
npm test
```

Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add server
git commit -m "chore(server): scaffold express + typescript + tests"
```

---

## Task 3: Implement Shared Types + Distance Metrics

**Files:**
- Create: `server/src/types.ts`
- Create: `server/src/math/distance.ts`
- Test: `server/test/distance.test.ts`

- [ ] **Step 1: Add distance tests (failing first)**

Create `server/test/distance.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cosine, euclidean, manhattan } from "../src/math/distance.js";

describe("distance", () => {
  it("euclidean", () => {
    expect(euclidean([0, 0], [3, 4])).toBeCloseTo(5, 6);
  });

  it("manhattan", () => {
    expect(manhattan([1, 2, 3], [3, 1, 1])).toBe(5);
  });

  it("cosine is 0 for identical vectors", () => {
    expect(cosine([1, 0, 0], [1, 0, 0])).toBeCloseTo(0, 6);
  });
});
```

- [ ] **Step 2: Implement types**

Create `server/src/types.ts`:

```ts
export type Vector = number[];

export type DistFn = (a: Vector, b: Vector) => number;

export type DemoCategory = "cs" | "math" | "food" | "sports" | "doc";

export type VectorItem = {
  id: number;
  metadata: string;
  category: DemoCategory | string;
  embedding: Vector;
};

export type SearchAlgo = "hnsw" | "kdtree" | "bruteforce";
export type Metric = "cosine" | "euclidean" | "manhattan";
```

- [ ] **Step 3: Implement distance metrics**

Create `server/src/math/distance.ts`:

```ts
import type { Vector } from "../types.js";

export function euclidean(a: Vector, b: Vector) {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s);
}

export function cosine(a: Vector, b: Vector) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na < 1e-9 || nb < 1e-9) return 1;
  return 1 - dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function manhattan(a: Vector, b: Vector) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s;
}
```

- [ ] **Step 4: Run tests**

Run:

```bash
cd server
npm test
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/src server/test
git commit -m "feat(server): add types and distance metrics"
```

---

## Task 4: Brute Force KNN (Demo Vectors)

**Files:**
- Create: `server/src/algos/bruteforce.ts`
- Test: `server/test/bruteforce.test.ts`

- [ ] **Step 1: Add tests**

Create `server/test/bruteforce.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { BruteForce } from "../src/algos/bruteforce.js";
import { euclidean } from "../src/math/distance.js";

describe("BruteForce", () => {
  it("returns nearest neighbors", () => {
    const bf = new BruteForce();
    bf.insert({ id: 1, embedding: [0, 0] });
    bf.insert({ id: 2, embedding: [10, 0] });
    bf.insert({ id: 3, embedding: [3, 4] });

    const res = bf.knn([0, 0], 2, euclidean);
    expect(res.map((x) => x.id)).toEqual([1, 3]);
  });
});
```

- [ ] **Step 2: Implement brute force**

Create `server/src/algos/bruteforce.ts`:

```ts
import type { DistFn, Vector } from "../types.js";

type Item = { id: number; embedding: Vector; metadata?: string; category?: string };

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
```

- [ ] **Step 3: Run tests**

Run:

```bash
cd server
npm test
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add server/src/algos/bruteforce.ts server/test/bruteforce.test.ts
git commit -m "feat(server): implement brute force knn"
```

---

## Task 5: KD-Tree (Exact Search)

**Files:**
- Create: `server/src/algos/kdtree.ts`
- Test: `server/test/kdtree.test.ts`

- [ ] **Step 1: Add KDTree test against brute force**

Create `server/test/kdtree.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { KDTree } from "../src/algos/kdtree.js";
import { BruteForce } from "../src/algos/bruteforce.js";
import { euclidean } from "../src/math/distance.js";

describe("KDTree", () => {
  it("matches brute force for euclidean", () => {
    const points = [
      { id: 1, embedding: [0, 0] },
      { id: 2, embedding: [10, 0] },
      { id: 3, embedding: [3, 4] },
      { id: 4, embedding: [2, 2] }
    ];

    const bf = new BruteForce();
    const kd = new KDTree(2);
    for (const p of points) {
      bf.insert(p);
      kd.insert(p);
    }

    const q = [1, 1];
    const k = 3;
    const bfRes = bf.knn(q, k, euclidean).map((x) => x.id);
    const kdRes = kd.knn(q, k, euclidean).map((x) => x.id);
    expect(kdRes).toEqual(bfRes);
  });
});
```

- [ ] **Step 2: Implement KDTree**

Create `server/src/algos/kdtree.ts`:

```ts
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
      if (heap.length > k) heap.pop();
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
```

- [ ] **Step 3: Run tests**

Run:

```bash
cd server
npm test
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add server/src/algos/kdtree.ts server/test/kdtree.test.ts
git commit -m "feat(server): implement kdtree knn"
```

---

## Task 6: HNSW (Approximate Search, Deterministic Seed)

**Files:**
- Create: `server/src/algos/hnsw.ts`
- Test: `server/test/hnsw.test.ts`

- [ ] **Step 1: Add an HNSW vs brute force sanity test**

Create `server/test/hnsw.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { HNSW } from "../src/algos/hnsw.js";
import { BruteForce } from "../src/algos/bruteforce.js";
import { cosine } from "../src/math/distance.js";

describe("HNSW", () => {
  it("returns k results for a simple dataset", () => {
    const bf = new BruteForce();
    const h = new HNSW({ m: 16, efBuild: 200, seed: 42 });
    for (let i = 0; i < 40; i++) {
      const emb = [Math.cos(i / 10), Math.sin(i / 10)];
      bf.insert({ id: i + 1, embedding: emb });
      h.insert({ id: i + 1, embedding: emb }, cosine);
    }
    const res = h.knn([1, 0], 5, 50, cosine);
    expect(res.length).toBe(5);
  });
});
```

- [ ] **Step 2: Implement HNSW (parity-focused port of current logic)**

Create `server/src/algos/hnsw.ts`:

```ts
import type { DistFn, Vector } from "../types.js";

type Item = { id: number; embedding: Vector };

type Node = {
  item: Item;
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

  insert(item: Item, dist: DistFn) {
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
    for (const [nid, nd] of this.G) {
      for (const layer of nd.nbrs) {
        const idx = layer.indexOf(id);
        if (idx >= 0) layer.splice(idx, 1);
      }
      if (nid === id) continue;
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
```

- [ ] **Step 3: Run tests**

Run:

```bash
cd server
npm test
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add server/src/algos/hnsw.ts server/test/hnsw.test.ts
git commit -m "feat(server): implement hnsw index"
```

---

## Task 7: Demo VectorDB (CRUD + Search + Benchmark + HNSW Info)

**Files:**
- Create: `server/src/db/demoData.ts`
- Create: `server/src/db/vectorDb.ts`
- Test: `server/test/vectorDb.test.ts`

- [ ] **Step 1: Add VectorDB test for insert/search/delete**

Create `server/test/vectorDb.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { VectorDB } from "../src/db/vectorDb.js";

describe("VectorDB", () => {
  it("insert/search/delete", () => {
    const db = new VectorDB(2);
    const id1 = db.insert("a", "cs", [0, 0]);
    const id2 = db.insert("b", "cs", [10, 0]);
    const out = db.search([0, 0], 2, "euclidean", "bruteforce");
    expect(out.hits.map((h) => h.id)).toEqual([id1, id2]);
    expect(db.remove(id2)).toBe(true);
    expect(db.remove(999)).toBe(false);
  });
});
```

- [ ] **Step 2: Implement demo dataset (port from C++ loadDemo exactly)**

Create `server/src/db/demoData.ts`:

```ts
import type { VectorItem } from "../types.js";

export const DEMO_DIMS = 16;

export function getDemoItems(): Omit<VectorItem, "id">[] {
  return [
    { metadata: "Linked List: nodes connected by pointers", category: "cs", embedding: [0.9,0.85,0.72,0.68,0.12,0.08,0.15,0.1,0.05,0.08,0.06,0.09,0.07,0.11,0.08,0.06] },
    { metadata: "Binary Search Tree: O(log n) search and insert", category: "cs", embedding: [0.88,0.82,0.78,0.74,0.15,0.1,0.08,0.12,0.06,0.07,0.08,0.05,0.09,0.06,0.07,0.1] },
    { metadata: "Dynamic Programming: memoization overlapping subproblems", category: "cs", embedding: [0.82,0.76,0.88,0.8,0.2,0.18,0.12,0.09,0.07,0.06,0.08,0.07,0.08,0.09,0.06,0.07] },
    { metadata: "Graph BFS and DFS: breadth and depth first traversal", category: "cs", embedding: [0.85,0.8,0.75,0.82,0.18,0.14,0.1,0.08,0.06,0.09,0.07,0.06,0.1,0.08,0.09,0.07] },
    { metadata: "Hash Table: O(1) lookup with collision chaining", category: "cs", embedding: [0.87,0.78,0.7,0.76,0.13,0.11,0.09,0.14,0.08,0.07,0.06,0.08,0.07,0.1,0.08,0.09] },
    { metadata: "Calculus: derivatives integrals and limits", category: "math", embedding: [0.12,0.15,0.18,0.1,0.91,0.86,0.78,0.72,0.08,0.06,0.07,0.09,0.07,0.08,0.06,0.1] },
    { metadata: "Linear Algebra: matrices eigenvalues eigenvectors", category: "math", embedding: [0.2,0.18,0.15,0.12,0.88,0.9,0.82,0.76,0.09,0.07,0.08,0.06,0.1,0.07,0.08,0.09] },
    { metadata: "Probability: distributions random variables Bayes theorem", category: "math", embedding: [0.15,0.12,0.2,0.18,0.84,0.8,0.88,0.82,0.07,0.08,0.06,0.1,0.09,0.06,0.09,0.08] },
    { metadata: "Number Theory: primes modular arithmetic RSA cryptography", category: "math", embedding: [0.22,0.16,0.14,0.2,0.8,0.85,0.76,0.9,0.08,0.09,0.07,0.06,0.08,0.1,0.07,0.06] },
    { metadata: "Combinatorics: permutations combinations generating functions", category: "math", embedding: [0.18,0.2,0.16,0.14,0.86,0.78,0.84,0.8,0.06,0.07,0.09,0.08,0.06,0.09,0.1,0.07] },
    { metadata: "Neapolitan Pizza: wood-fired dough San Marzano tomatoes", category: "food", embedding: [0.08,0.06,0.09,0.07,0.07,0.08,0.06,0.09,0.9,0.86,0.78,0.72,0.08,0.06,0.09,0.07] },
    { metadata: "Sushi: vinegared rice raw fish and nori rolls", category: "food", embedding: [0.06,0.08,0.07,0.09,0.09,0.06,0.08,0.07,0.86,0.9,0.82,0.76,0.07,0.09,0.06,0.08] },
    { metadata: "Ramen: noodle soup with chashu pork and soft-boiled eggs", category: "food", embedding: [0.09,0.07,0.06,0.08,0.08,0.09,0.07,0.06,0.82,0.78,0.9,0.84,0.09,0.07,0.08,0.06] },
    { metadata: "Tacos: corn tortillas with carnitas salsa and cilantro", category: "food", embedding: [0.07,0.09,0.08,0.06,0.06,0.07,0.09,0.08,0.78,0.82,0.86,0.9,0.06,0.08,0.07,0.09] },
    { metadata: "Croissant: laminated pastry with buttery flaky layers", category: "food", embedding: [0.06,0.07,0.1,0.09,0.1,0.06,0.07,0.1,0.85,0.8,0.76,0.82,0.09,0.07,0.1,0.06] },
    { metadata: "Basketball: fast-paced shooting dribbling slam dunks", category: "sports", embedding: [0.09,0.07,0.08,0.1,0.08,0.09,0.07,0.06,0.08,0.07,0.09,0.06,0.91,0.85,0.78,0.72] },
    { metadata: "Football: tackles touchdowns field goals and strategy", category: "sports", embedding: [0.07,0.09,0.06,0.08,0.09,0.07,0.1,0.08,0.07,0.09,0.08,0.07,0.87,0.89,0.82,0.76] },
    { metadata: "Tennis: racket volleys groundstrokes and Wimbledon serves", category: "sports", embedding: [0.08,0.06,0.09,0.07,0.07,0.08,0.06,0.09,0.09,0.06,0.07,0.08,0.83,0.8,0.88,0.82] },
    { metadata: "Chess: openings endgames tactics strategic board game", category: "sports", embedding: [0.25,0.2,0.22,0.18,0.22,0.18,0.2,0.15,0.06,0.08,0.07,0.09,0.8,0.84,0.78,0.9] },
    { metadata: "Swimming: butterfly freestyle backstroke Olympic competition", category: "sports", embedding: [0.06,0.08,0.07,0.09,0.08,0.06,0.09,0.07,0.1,0.08,0.06,0.07,0.85,0.82,0.86,0.8] }
  ];
}
```

- [ ] **Step 3: Implement VectorDB**

Create `server/src/db/vectorDb.ts`:

```ts
import { BruteForce } from "../algos/bruteforce.js";
import { KDTree } from "../algos/kdtree.js";
import { HNSW } from "../algos/hnsw.js";
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
    const remaining = Array.from(this.store.values()).map((x) => ({ id: x.id, embedding: x.embedding }));
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
```

- [ ] **Step 4: Run tests**

Run:

```bash
cd server
npm test
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/src/db server/test/vectorDb.test.ts
git commit -m "feat(server): implement demo vector database"
```

---

## Task 8: Ollama Client + Text Chunker + DocumentDB (RAG)

**Files:**
- Create: `server/src/text/chunker.ts`
- Create: `server/src/ollama/ollamaClient.ts`
- Create: `server/src/db/documentDb.ts`
- Test: `server/test/chunker.test.ts`

- [ ] **Step 1: Implement chunker (250 words, 30 overlap)**

Create `server/src/text/chunker.ts`:

```ts
export function chunkText(text: string, chunkWords = 250, overlapWords = 30) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  if (words.length <= chunkWords) return [text];
  const chunks: string[] = [];
  const step = chunkWords - overlapWords;
  for (let i = 0; i < words.length; i += step) {
    const end = Math.min(i + chunkWords, words.length);
    chunks.push(words.slice(i, end).join(" "));
    if (end === words.length) break;
  }
  return chunks;
}
```

- [ ] **Step 2: Add chunker test**

Create `server/test/chunker.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { chunkText } from "../src/text/chunker.js";

describe("chunkText", () => {
  it("returns one chunk if short", () => {
    expect(chunkText("a b c", 5, 1)).toEqual(["a b c"]);
  });
});
```

- [ ] **Step 3: Implement Ollama client compatible with C++ behavior**

Create `server/src/ollama/ollamaClient.ts`:

```ts
export type OllamaStatus = {
  ollamaAvailable: boolean;
  embedModel: string;
  genModel: string;
};

export class OllamaClient {
  constructor(
    private baseUrl = "http://127.0.0.1:11434",
    public embedModel = "nomic-embed-text",
    public genModel = "llama3.2"
  ) {}

  async isAvailable() {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      return res.ok;
    } catch {
      return false;
    }
  }

  async embed(prompt: string): Promise<number[]> {
    const res = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.embedModel, prompt })
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { embedding?: number[] };
    return Array.isArray(data.embedding) ? data.embedding : [];
  }

  async generate(prompt: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.genModel, prompt, stream: false })
    });
    if (!res.ok) return "ERROR: Ollama unavailable. Run: ollama serve";
    const data = (await res.json()) as { response?: string };
    return typeof data.response === "string" ? data.response : "";
  }
}
```

- [ ] **Step 4: Implement DocumentDB**

Create `server/src/db/documentDb.ts`:

```ts
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
```

- [ ] **Step 5: Run tests**

Run:

```bash
cd server
npm test
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add server/src/text server/src/ollama server/src/db/documentDb.ts server/test/chunker.test.ts
git commit -m "feat(server): add chunker, ollama client, and document db"
```

---

## Task 9: Implement API Routes (Exact Contract)

**Files:**
- Modify: `server/src/app.ts`
- Create: `server/src/routes/demoRoutes.ts`
- Create: `server/src/routes/docRoutes.ts`
- Create: `server/src/routes/metaRoutes.ts`
- Test: `server/test/api-parity.test.ts`

- [ ] **Step 1: Add API parity tests for endpoint presence**

Create `server/test/api-parity.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("api parity", () => {
  it("exposes /stats", async () => {
    const app = createApp();
    const res = await request(app).get("/stats");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("algorithms");
    expect(res.body).toHaveProperty("metrics");
  });
});
```

- [ ] **Step 2: Implement routes and wire them into app.ts**

Create `server/src/routes/demoRoutes.ts`:

```ts
import type { Router } from "express";
import type { VectorDB } from "../db/vectorDb.js";
import { applyCors } from "../cors.js";

function parseVec(s: string) {
  return s
    .split(",")
    .map((t) => Number(t))
    .filter((x) => Number.isFinite(x));
}

export function registerDemoRoutes(router: Router, db: VectorDB) {
  router.get("/search", (req, res) => {
    applyCors(res);
    const q = parseVec(String(req.query.v ?? ""));
    if (q.length !== db.dims) {
      res.json({ error: `need ${db.dims}D vector` });
      return;
    }
    const k = Number(req.query.k ?? 5);
    const metric = String(req.query.metric ?? "cosine");
    const algo = String(req.query.algo ?? "hnsw");
    const out = db.search(q, Number.isFinite(k) ? k : 5, metric as any, algo as any);
    res.json(out);
  });

  router.post("/insert", (req, res) => {
    applyCors(res);
    const meta = String(req.body?.metadata ?? "");
    const cat = String(req.body?.category ?? "");
    const emb = Array.isArray(req.body?.embedding) ? req.body.embedding.map(Number) : [];
    if (!meta || !emb.length || emb.length !== db.dims) {
      res.json({ error: "invalid body" });
      return;
    }
    const id = db.insert(meta, cat, emb);
    res.json({ id });
  });

  router.delete("/delete/:id", (req, res) => {
    applyCors(res);
    const id = Number(req.params.id);
    const ok = Number.isFinite(id) ? db.remove(id) : false;
    res.json({ ok });
  });

  router.get("/items", (_req, res) => {
    applyCors(res);
    res.json(db.all());
  });

  router.get("/benchmark", (req, res) => {
    applyCors(res);
    const q = parseVec(String(req.query.v ?? ""));
    if (q.length !== db.dims) {
      res.json({ error: `need ${db.dims}D vector` });
      return;
    }
    const k = Number(req.query.k ?? 5);
    const metric = String(req.query.metric ?? "cosine");
    res.json(db.benchmark(q, Number.isFinite(k) ? k : 5, metric as any));
  });

  router.get("/hnsw-info", (_req, res) => {
    applyCors(res);
    res.json(db.hnswInfo());
  });
}
```

Create `server/src/routes/docRoutes.ts`:

```ts
import type { Router } from "express";
import { applyCors } from "../cors.js";
import type { DocumentDB } from "../db/documentDb.js";
import type { OllamaClient } from "../ollama/ollamaClient.js";
import { chunkText } from "../text/chunker.js";

function countWords(text: string) {
  const ws = text.trim().split(/\s+/).filter(Boolean);
  return ws.length;
}

export function registerDocRoutes(router: Router, docDb: DocumentDB, ollama: OllamaClient) {
  router.post("/doc/insert", async (req, res) => {
    applyCors(res);
    const title = String(req.body?.title ?? "");
    const text = String(req.body?.text ?? "");
    if (!title || !text) {
      res.json({ error: "need title and text" });
      return;
    }

    const chunks = chunkText(text, 250, 30);
    const ids: number[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const emb = await ollama.embed(chunks[i]);
      if (!emb.length) {
        res.json({
          error:
            "Ollama unavailable. Install from https://ollama.com then run: ollama pull nomic-embed-text && ollama pull llama3.2"
        });
        return;
      }
      const chunkTitle =
        chunks.length > 1 ? `${title} [${i + 1}/${chunks.length}]` : title;
      ids.push(docDb.insert(chunkTitle, chunks[i], emb));
    }

    res.json({ ids, chunks: chunks.length, dims: docDb.getDims() });
  });

  router.delete("/doc/delete/:id", (req, res) => {
    applyCors(res);
    const id = Number(req.params.id);
    const ok = Number.isFinite(id) ? docDb.remove(id) : false;
    res.json({ ok });
  });

  router.get("/doc/list", (_req, res) => {
    applyCors(res);
    const docs = docDb.all().map((d) => {
      const preview = d.text.length > 120 ? `${d.text.slice(0, 120)}…` : d.text;
      return { id: d.id, title: d.title, preview, words: countWords(d.text) };
    });
    res.json(docs);
  });

  router.post("/doc/search", async (req, res) => {
    applyCors(res);
    const question = String(req.body?.question ?? "");
    const k = Number(req.body?.k ?? 3);
    if (!question) {
      res.json({ error: "need question" });
      return;
    }
    const qEmb = await ollama.embed(question);
    if (!qEmb.length) {
      res.json({ error: "Ollama unavailable" });
      return;
    }
    const hits = docDb.search(qEmb, Number.isFinite(k) ? k : 3);
    res.json({
      contexts: hits.map((h) => ({
        id: h.item.id,
        title: h.item.title,
        distance: Number(h.distance.toFixed(4))
      }))
    });
  });

  router.post("/doc/ask", async (req, res) => {
    applyCors(res);
    const question = String(req.body?.question ?? "");
    const k = Number(req.body?.k ?? 3);
    if (!question) {
      res.json({ error: "need question" });
      return;
    }
    const qEmb = await ollama.embed(question);
    if (!qEmb.length) {
      res.json({ error: "Ollama unavailable" });
      return;
    }
    const hits = docDb.search(qEmb, Number.isFinite(k) ? k : 3);

    const ctx = hits
      .map((h, i) => `[${i + 1}] ${h.item.title}:\n${h.item.text}\n\n`)
      .join("");

    const prompt =
      "You are a helpful assistant. Answer the user's question directly. " +
      "Use the provided context if it contains relevant information. " +
      "If it doesn't, just use your own general knowledge. " +
      "IMPORTANT: Do NOT mention the 'context', 'provided text', or say things like 'the context doesn't mention'. " +
      "Just answer the question naturally.\n\n" +
      "Context:\n" +
      ctx +
      "Question: " +
      question +
      "\n\nAnswer:";

    const answer = await ollama.generate(prompt);
    res.json({
      answer,
      model: ollama.genModel,
      contexts: hits.map((h) => ({
        id: h.item.id,
        title: h.item.title,
        text: h.item.text,
        distance: Number(h.distance.toFixed(4))
      })),
      docCount: docDb.size()
    });
  });
}
```

Create `server/src/routes/metaRoutes.ts`:

```ts
import type { Router } from "express";
import { applyCors } from "../cors.js";
import type { DocumentDB } from "../db/documentDb.js";
import type { VectorDB } from "../db/vectorDb.js";
import type { OllamaClient } from "../ollama/ollamaClient.js";

export function registerMetaRoutes(router: Router, db: VectorDB, docDb: DocumentDB, ollama: OllamaClient) {
  router.get("/status", async (_req, res) => {
    applyCors(res);
    const up = await ollama.isAvailable();
    res.json({
      ollamaAvailable: up,
      embedModel: ollama.embedModel,
      genModel: ollama.genModel,
      docCount: docDb.size(),
      docDims: docDb.getDims(),
      demoDims: db.dims,
      demoCount: db.all().length
    });
  });

  router.get("/stats", (_req, res) => {
    applyCors(res);
    res.json(db.stats());
  });
}
```

Update `server/src/app.ts` to the final wired version:

```ts
import express from "express";
import cors from "cors";
import { applyCors } from "./cors.js";
import { VectorDB } from "./db/vectorDb.js";
import { DocumentDB } from "./db/documentDb.js";
import { OllamaClient } from "./ollama/ollamaClient.js";
import { registerDemoRoutes } from "./routes/demoRoutes.js";
import { registerDocRoutes } from "./routes/docRoutes.js";
import { registerMetaRoutes } from "./routes/metaRoutes.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.options(/.*/, (_req, res) => {
    applyCors(res);
    res.status(204).end();
  });

  const db = new VectorDB(16);
  db.loadDemo();
  const docDb = new DocumentDB();
  const ollama = new OllamaClient();

  registerDemoRoutes(app, db);
  registerDocRoutes(app, docDb, ollama);
  registerMetaRoutes(app, db, docDb, ollama);

  app.get("/health", (_req, res) => {
    applyCors(res);
    res.json({ ok: true });
  });

  return app;
}
```

- [ ] **Step 3: Run tests**

Run:

```bash
cd server
npm test
```

Expected: PASS

- [ ] **Step 4: Manual smoke test**

Run:

```bash
cd server
npm run dev
```

Then in another terminal:

```bash
curl "http://localhost:8080/stats"
```

Expected: JSON with `algorithms` and `metrics`.

- [ ] **Step 5: Commit**

```bash
git add server/src server/test/api-parity.test.ts
git commit -m "feat(server): implement REST API parity"
```

---

## Self-Review Checklist (Plan)

- API parity: Tasks 7–9 cover all endpoints from the original server.
- Algorithm parity: Tasks 3–6 implement metrics + brute force + KD-tree + HNSW.
- Gaps to watch: HNSW graph info node metadata/category mapping, rounding/precision differences, and exact JSON field naming.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-04-vector-db-mern-rewrite.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?

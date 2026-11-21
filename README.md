# Vector Field — MERN Vector Search + RAG

A live vector search lab. Compare **HNSW**, **KD-tree**, and **brute force** on the same 16-dimensional field, inspect the projected clusters, add documents to a MongoDB library, and ask questions against a real retrieval pipeline.

This is the MERN rebuild of the original C++ vector database. The C++ implementation is preserved in [`engine/`](engine/) for reference.

## Live demo

| Surface | URL |
|---|---|
| React vector lab | https://vector-field-gamma.vercel.app |
| Express API | https://vector-ai-api.onrender.com/api/health |

## What works

- **20 demo vectors / 16D.** Five items each across CS, math, food, and sports, projected to 2D with PCA for the scatter plot.
- **Three search structures.** HNSW (layered proximity graph), KD-tree (axis-aligned splits with backtracking), and brute force.
- **Three metrics.** Cosine, Euclidean, and Manhattan.
- **Real benchmark.** Every demo vector is used as a query. Recall is measured against brute force at the selected k.
- **MongoDB document library.** Twelve seeded passages, each with a 256-dimensional hash embedding. Add or delete a passage and the document index rebuilds.
- **Extractive RAG.** A question is embedded, matched against the document index, and answered by ranking the retrieved sentences. Retrieval and timings are real; no language model is called.
- **Honest labelling.** The live embedding is lexical `hash-256`, not a semantic transformer. The UI says so in the library, ask page, and method page.

## Architecture

```
web/                 React + Vite frontend
  src/
    pages/           Lab, library, ask, method
    components/      Vector field projection
    useVectorLab.js  API state and actions

api/                 Express + MongoDB API
  src/
    algorithms/      HNSW, KD-tree, brute force
    embedding.js     Deterministic hash-256 embeddings
    metrics.js       Cosine, Euclidean, Manhattan
    projection.js    PCA projection for the scatter plot
    searchEngine.js  Index lifecycle, search, benchmark, RAG
    models.js        DemoVector and Document schemas
    seed.js          Demo vectors and 12 seeded passages

engine/              Original C++ vector database and web UI
```

## API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/stats` | Index and embedding stats |
| `GET` | `/api/demo` | 16D vectors + 2D projection |
| `POST` | `/api/search` | Query HNSW, KD-tree, or brute force |
| `POST` | `/api/benchmark` | Latency and recall comparison |
| `GET` | `/api/documents` | Document library |
| `POST` | `/api/documents` | Embed and index a passage |
| `DELETE` | `/api/documents/:id` | Remove a passage |
| `POST` | `/api/ask` | Retrieve passages and build an extractive answer |

## Run locally

```bash
npm run install:all

# API (port 4300)
# api/.env: MONGODB_URI=...
npm run dev:api

# Web (port 5177, proxies /api to 4300)
npm run dev:web
```

## Tests

```bash
npm test
```

Eleven tests cover hash embeddings, KD-tree and HNSW recall, PCA projection, the demo field, all three search algorithms, benchmarking, document add/delete, extractive answers, and invalid input.

## Deployment

- **Frontend:** Vercel static build, proxying `/api` to the Render API.
- **API:** Render web service from `api/`.
- **Database:** MongoDB Atlas database `vectorai` on `Cluster0`.

## Honest limitations

- The live embedding is a deterministic hash of tokens and bigrams. It captures lexical overlap, not deep semantics.
- The 16D demo vectors are hand-authored for clustering; they are not learned embeddings.
- HNSW is approximate. The benchmark reports its recall instead of hiding it.
- The document index lives in one Node process and is rebuilt from MongoDB after changes. Production needs persistence, replication, and filtered search.
- There is no authentication; this is a public lab.
- No LLM is called. The answer is extractive and cites the passages it used.

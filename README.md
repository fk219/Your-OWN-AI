# VectorDB (MERN) — Vector Search + HNSW + RAG Demo

A recruiter-focused demo project that shows how a vector database works under the hood:
- Implements **Brute Force**, **KD-Tree**, and **HNSW** nearest-neighbor search from scratch
- Visualizes embeddings in a **2D PCA “semantic space”**
- Adds a local **RAG** workflow using **Ollama** (optional)

This repository contains a full working app:
- **React (Vite + TypeScript)** frontend in [client/](file:///workspace/client)
- **Node + Express (TypeScript)** backend in [server/](file:///workspace/server)

> MongoDB is intentionally not included yet (data is in-memory). The goal is to demonstrate indexing + retrieval + UX, not persistence.

---

## What You Can Demo (Recruiter Checklist)

- **Algorithm comparison:** HNSW vs KD-Tree vs Brute Force
- **Distance metrics:** Cosine / Euclidean / Manhattan
- **Latency instrumentation:** each search returns microsecond latency from the backend
- **Visualization:** PCA scatter plot with hit highlighting
- **RAG:** insert documents → ask questions → see retrieved context (requires Ollama)

---

## Architecture (High Level)

```
React UI (client)
  ├─ Search / Benchmark / HNSW Info
  ├─ Documents (chunk + embed via Ollama)
  └─ Ask AI (RAG)
        │
        ▼
Express API (server)
  ├─ VectorDB (16D demo vectors)
  │    ├─ BruteForce
  │    ├─ KDTree
  │    └─ HNSW
  └─ DocumentDB (real embeddings via Ollama)
       └─ HNSW (cosine) over chunk embeddings
        │
        ▼
Ollama (optional, local)
  ├─ nomic-embed-text  (embeddings)
  └─ llama3.2          (generation)
```

---

## Quick Start (Recommended)

### 1) Install dependencies

```bash
cd /path/to/repo
npm install
```

### 2) Run backend (API)

```bash
cd server
npm run dev
```

Backend runs on:
- http://localhost:8080

### 3) Run frontend (UI)

In a new terminal:

```bash
cd client
npm run dev
```

Frontend runs on:
- http://localhost:5174 (or the next free port)

---

## Enable RAG (Ollama)

RAG features require Ollama running locally on the same machine as the backend.

### Install + run

```bash
ollama serve
ollama pull nomic-embed-text
ollama pull llama3.2
```

### Verify

```bash
curl http://127.0.0.1:11434/api/tags
```

Then refresh the app. The top bar should show **OLLAMA: Online**.

---

## API Endpoints (Backend)

Base URL: `http://localhost:8080`

- `GET /stats` — supported algos/metrics + dims
- `GET /items` — list demo vectors
- `GET /search?v=<comma-separated-16d>&k=<int>&metric=<cosine|euclidean|manhattan>&algo=<hnsw|kdtree|bruteforce>`
- `POST /insert` — `{ metadata, category, embedding }`
- `DELETE /delete/:id`
- `GET /benchmark?v=<...>&k=<int>&metric=<...>`
- `GET /hnsw-info` — layer counts + edges + nodes

Documents / RAG:
- `POST /doc/insert` — `{ title, text }` (chunks + embeds via Ollama)
- `GET /doc/list`
- `DELETE /doc/delete/:id`
- `POST /doc/search` — `{ question, k }`
- `POST /doc/ask` — `{ question, k }`

Health / status:
- `GET /health`
- `GET /status` — includes `ollamaAvailable`

---

## What’s Implemented “From Scratch”

### HNSW

HNSW (Hierarchical Navigable Small World) is the same family of ANN algorithm used in many production vector DBs.
This project implements:
- multi-layer graph construction
- neighbor selection + pruning
- approximate k-NN search using an ef parameter

Implementation: [server/src/algos/hnsw.ts](file:///workspace/server/src/algos/hnsw.ts)

### KD-Tree + Brute Force

Baselines for comparison:
- Brute Force is the correctness reference
- KD-Tree gives exact-ish performance intuition (especially in low dims)

Implementations: [server/src/algos/](file:///workspace/server/src/algos)

---

## Repo Layout

```
client/   React UI (Vite + TS)
server/   Node/Express API (TS) + algos + in-memory DBs
docs/     design + implementation plans
```

---

## Notes for Recruiters

If you only have 2–3 minutes:
- Run 3 searches with different algos and show latency changing
- Click benchmark to show the comparison bars
- Insert a document (if Ollama is online) and ask a question to show RAG + retrieved context

4. llama3.2 → generates an answer based only on your documents
```

The answer streams in with a typewriter effect. Click the **context chips** to see exactly which chunks the AI used.

---

## REST API Reference

The server exposes a full REST API at `http://localhost:8080`.

### Demo Vector Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/search?v=f1,f2,...&k=5&metric=cosine&algo=hnsw` | K-NN search |
| `POST` | `/insert` | Insert a demo vector |
| `DELETE` | `/delete/:id` | Delete by ID |
| `GET` | `/items` | List all demo vectors |
| `GET` | `/benchmark?v=...&k=5&metric=cosine` | Compare all 3 algorithms |
| `GET` | `/hnsw-info` | HNSW graph structure and layer stats |
| `GET` | `/stats` | Database statistics |

### Document & RAG Endpoints

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/doc/insert` | `{"title":"...","text":"..."}` | Embed and store document |
| `GET` | `/doc/list` | — | List all stored documents |
| `DELETE` | `/doc/delete/:id` | — | Delete document chunk |
| `POST` | `/doc/ask` | `{"question":"...","k":3}` | RAG: retrieve + generate |
| `GET` | `/status` | — | Ollama status and model info |

### Example: Search via curl

```powershell
curl "http://localhost:8080/search?v=0.9,0.8,0.7,0.6,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1&k=3&metric=cosine&algo=hnsw"
```

### Example: Ask a question via curl

```powershell
curl -X POST http://localhost:8080/doc/ask `
  -H "Content-Type: application/json" `
  -d '{"question":"What is dynamic programming?","k":3}'
```

---

## Project Structure

```
VectorDB/
├── main.cpp        ← C++ backend (HNSW, KD-Tree, BruteForce, REST API, RAG)
├── httplib.h       ← Single-header HTTP server library (cpp-httplib)
├── index.html      ← Frontend (PCA scatter plot, chat UI, benchmark)
└── README.md       ← This file
```

### Architecture (main.cpp)

```
BruteForce          O(N·d)      Exact, baseline
KDTree              O(log N)    Exact, axis-aligned partitioning
HNSW                O(log N)    Approximate, multilayer small-world graph

VectorDB            Unified interface over all 3 (16D demo vectors)
DocumentDB          HNSW-only index for real Ollama embeddings (768D)
OllamaClient        HTTP client → /api/embeddings + /api/generate
```

---

## Algorithm Deep Dive

### HNSW (Hierarchical Navigable Small World)

Nodes are inserted into a multilayer graph. Each node randomly gets assigned a maximum layer. Layer 0 has all nodes with many connections; higher layers have fewer nodes (exponentially fewer) with longer-range connections.

**Insert:** Start at the top layer, greedily find the nearest node, drop a layer, repeat. At each layer from your assigned max down to 0, run a beam search (ef_construction=200) and connect to the M nearest neighbors bidirectionally.

**Search:** Same greedy descent from top layer. At layer 0, expand to ef nearest candidates using a priority queue.

**Why it's fast:** The upper layers act like a highway — you quickly get to the right neighborhood, then zoom in at layer 0.

### KD-Tree (K-Dimensional Tree)

Binary space partitioning. Each node splits space along one dimension (cycling through all dimensions). Search prunes entire subtrees when the closest possible point in that subtree can't beat the current best — the "ball within hyperslab" check.

**Weakness:** Degrades with high dimensions (curse of dimensionality). Works well for ≤20D, becomes close to brute force at 768D.

### Why HNSW Wins at High Dimensions

KD-Tree pruning relies on axis-aligned distance bounds. In high dimensions, almost all the space is near the boundary of the hypersphere — no subtrees get pruned. HNSW's graph-based approach doesn't have this problem.

---

## Common Issues

| Problem | Fix |
|---|---|
| `Ollama: OFFLINE` in header | Run `ollama serve` in a terminal |
| Embedding takes forever | Ollama is downloading the model on first use, wait 2 min |
| `g++: command not found` | Add `C:\msys64\ucrt64\bin` to Windows PATH |
| Port 8080 already in use | Kill the process: `netstat -ano \| findstr 8080` then `taskkill /PID <pid> /F` |
| LLM answer is slow | Normal — llama3.2 takes 10–30s on a laptop CPU. Use llama3.2:1b for faster answers |

### Use a Smaller/Faster LLM

If llama3.2 is too slow on your laptop, switch to the 1B model:

```powershell
ollama pull llama3.2:1b
```

Then edit [main.cpp](main.cpp) line where `genModel` is set:
```cpp
std::string genModel = "llama3.2:1b";   // change this
```
Recompile and restart.

---

## License

MIT — use this however you want.

# VectorDB UI Redesign (Recruiter-Focused Dashboard) — Spec

## Goal

Create a recruiter-focused, professional dark dashboard UI for the VectorDB app that:
- Preserves every existing user-visible capability (Search, insert/delete vectors, benchmark, HNSW info, Documents insert/list/delete, Ask AI with contexts)
- Uses the existing REST API contract exactly (no backend changes required)
- Replaces the current legacy DOM-injection UI (`client/src/legacyUi.ts`) with real React components

## Non-Goals

- Changing search correctness or algorithm behavior
- Adding MongoDB persistence
- Changing existing backend endpoint shapes or parameter names

## Success Criteria

- The app looks and feels like a modern product demo suitable for a portfolio/recruiter review
- All flows work end-to-end using the current API:
  - Search (HNSW/KD/Brute), metrics (cosine/euclid/manhattan), top-k slider, results list, latency
  - Compare all algos benchmark
  - HNSW layers visualization
  - Insert/delete demo vectors
  - Document chunk insert, list, delete
  - Ask AI returns answer + context chips; clicking chips reveals full chunk text
  - Ollama offline state clearly communicated
- No blocking UI stalls during rendering (smooth canvas and lists)

## Design Direction

**Theme:** professional dark dashboard with subtle accent color system and high readability.

**Narrative for recruiters:** the UI emphasizes:
- "What this project demonstrates" (HNSW, metrics, RAG, benchmarking)
- Real-time instrumentation (latency, algo comparison)
- A clean information hierarchy (visualization + controls + results)

## Information Architecture

### Top Bar

- Left: Project name: “VectorDB”
- Center: quick status pills:
  - “HNSW”, “KD-Tree”, “Brute Force”
  - “Ollama: Online/Offline”
- Right: compact stats (vectors count, dims) + optional actions:
  - “Reset Demo”
  - “API: /stats”

### Main Layout (Redesigned)

Two-column dashboard (responsive):
- **Left (primary)**: large scatter visualization card
  - overlay mini-metrics strip: algo, metric, k, latency
  - hover tooltip
  - query star + link lines to hits (existing behavior)
- **Right (secondary)**: workspace panel with tabs:
  - Search
  - Documents
  - Ask AI

Optional bottom drawer (collapsed by default):
- “Project Story” panel (short bullet explanation of HNSW/RAG, not interactive)

## UX Enhancements (In Order)

### 1) Modern Styling

- Consistent spacing scale, typography hierarchy, and component styling
- Replace inline styles with reusable components and CSS modules or single global stylesheet
- Cleaner cards, buttons, and inputs (focus rings, hover, disabled)
- Unified color system (accent + semantic states)

### 2) Better UX

- Loading indicators for:
  - search, benchmark, hnsw-info, status, doc insert/list/delete, ask
- Error banners/toasts instead of `alert(...)`
- Empty states:
  - “No results”
  - “No documents”
  - “Ollama offline (how to enable)”
- Confirmations:
  - delete vector
  - delete document chunk
- Keyboard shortcuts:
  - Enter = Search
  - Ctrl+Enter = Ask AI

### 3) Performance

- AbortController for in-flight requests when a new request is started
- Memoize PCA computation; recompute only when item list changes
- Keep the canvas renderer in a single RAF loop with minimal allocations
- Avoid rebuilding large DOM strings; use React lists with stable keys

## Component Breakdown (Client)

### App Shell

- `AppLayout`: owns layout grid and top bar
- `TopBar`: status + stats
- `WorkspaceTabs`: Search / Documents / Ask AI

### Visualization

- `ScatterCanvas`:
  - draws PCA points from `items`
  - highlights `hitIds`
  - draws query star
  - tooltip logic
- `VectorBars`: 16D embedding bars for the query

### Search

- `SearchControls`:
  - query input
  - algo buttons (HNSW/KD/Brute)
  - metric select
  - top-k slider
- `SearchResults`:
  - results list, delete actions
  - calls backend delete, refresh items + hnsw-info
- `BenchmarkPanel`:
  - compares bruteforce/kdtree/hnsw latencies
- `HnswLayersPanel`:
  - shows nodesPerLayer/edgesPerLayer

### Documents

- `OllamaStatusCard`
- `DocumentInsertForm`
- `DocumentList`

### Ask AI

- `AskAiForm`
- `ChatTranscript`
  - answer rendering + typewriter effect (keep)
  - context chips + expand/collapse

## Data Flow / State

Central client state (React state + hooks; no extra state library initially):
- `items` from `GET /items`
- `hnswInfo` from `GET /hnsw-info`
- `status` from `GET /status`
- `searchState`: `queryText`, `algo`, `metric`, `k`
- `searchResults` from `/search`
- `benchResults` from `/benchmark`
- `docs` from `/doc/list`
- `chat` from `/doc/ask` and `/doc/search` (for highlight)
- `hitIds` derived from latest search or doc/search contexts

## API Client (Client)

Create a typed `api.ts` wrapper around the REST endpoints. Requirements:
- Request cancellation for search/ask/benchmark calls
- Convert errors into user-facing messages (no console spam)

## Migration Plan (UI)

1) Keep backend unchanged.
2) Replace `legacyUi.ts` mount approach with real React components.
3) Validate parity by running the same manual flows currently possible in the legacy UI.

## Testing / Verification

- Manual acceptance checklist:
  - Search all algos + metrics
  - Delete vector and verify it disappears from scatter + items
  - Insert vector and verify it appears
  - Benchmark loads bars
  - HNSW layers loads
  - Doc insert works when Ollama online; doc list updates; delete works
  - Ask AI returns answer + contexts; chips expand
  - Ollama offline shows clear instructions

## Open Decisions (Locked for this iteration)

- No MongoDB usage in UI
- No router/multi-page navigation; single dashboard view only


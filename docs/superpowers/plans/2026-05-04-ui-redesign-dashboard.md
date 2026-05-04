# VectorDB UI Redesign (Recruiter Dashboard) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current legacy DOM-injection UI with a recruiter-focused React dashboard UI while preserving all existing functionality and the same REST API.

**Architecture:** A typed `api` layer wraps existing endpoints with request cancellation. A React app-shell provides the new layout (top bar + left visualization + right workspace tabs). Visualization stays canvas-based but driven by React state; all flows show loading/error states and avoid blocking UI.

**Tech Stack:** React, TypeScript, Vite, fetch + AbortController.

---

## File Structure (Client)

- Modify: `client/src/App.tsx` (remove legacy mount, render new dashboard)
- Modify: `client/src/main.tsx` (ensure dashboard styles)
- Modify: `client/src/styles.css` (dashboard theme + components)
- Delete/Stop using: `client/src/legacyUi.ts` (keep temporarily until parity reached, then remove)
- Create: `client/src/api/types.ts`
- Create: `client/src/api/client.ts`
- Create: `client/src/api/endpoints.ts`
- Create: `client/src/hooks/useApi.ts`
- Create: `client/src/hooks/useHotkeys.ts`
- Create: `client/src/lib/pca.ts`
- Create: `client/src/lib/textToEmbedding.ts`
- Create: `client/src/lib/format.ts`
- Create: `client/src/components/layout/AppLayout.tsx`
- Create: `client/src/components/layout/TopBar.tsx`
- Create: `client/src/components/layout/WorkspaceTabs.tsx`
- Create: `client/src/components/layout/RightPanel.tsx`
- Create: `client/src/components/visual/ScatterCanvas.tsx`
- Create: `client/src/components/visual/Tooltip.tsx`
- Create: `client/src/components/visual/VectorBars.tsx`
- Create: `client/src/components/search/SearchTab.tsx`
- Create: `client/src/components/search/SearchControls.tsx`
- Create: `client/src/components/search/SearchResults.tsx`
- Create: `client/src/components/search/BenchmarkPanel.tsx`
- Create: `client/src/components/search/HnswLayersPanel.tsx`
- Create: `client/src/components/docs/DocumentsTab.tsx`
- Create: `client/src/components/docs/OllamaStatusCard.tsx`
- Create: `client/src/components/docs/DocumentInsertForm.tsx`
- Create: `client/src/components/docs/DocumentList.tsx`
- Create: `client/src/components/ai/AskAiTab.tsx`
- Create: `client/src/components/ai/ChatTranscript.tsx`
- Create: `client/src/components/ui/Button.tsx`
- Create: `client/src/components/ui/Input.tsx`
- Create: `client/src/components/ui/Select.tsx`
- Create: `client/src/components/ui/Toast.tsx`
- Create: `client/src/components/ui/Spinner.tsx`

---

### Task 1: Add Typed API Client (Cancellation + Errors)

**Files:**
- Create: `client/src/api/types.ts`
- Create: `client/src/api/client.ts`
- Create: `client/src/api/endpoints.ts`

- [ ] **Step 1: Create shared API types**

Create `client/src/api/types.ts`:

```ts
export type Metric = "cosine" | "euclidean" | "manhattan";
export type SearchAlgo = "hnsw" | "kdtree" | "bruteforce";

export type DemoItem = {
  id: number;
  metadata: string;
  category: string;
  embedding: number[];
};

export type SearchHit = {
  id: number;
  metadata: string;
  category: string;
  distance: number;
  embedding: number[];
};

export type SearchResponse = {
  results: SearchHit[];
  latencyUs: number;
  algo: string;
  metric: string;
};

export type BenchmarkResponse = {
  bruteforceUs: number;
  kdtreeUs: number;
  hnswUs: number;
  itemCount: number;
};

export type HnswInfoResponse = {
  topLayer: number;
  nodeCount: number;
  nodesPerLayer: number[];
  edgesPerLayer: number[];
  nodes: Array<{ id: number; metadata: string; category: string; maxLyr: number }>;
  edges: Array<{ src: number; dst: number; lyr: number }>;
};

export type StatusResponse = {
  ollamaAvailable: boolean;
  embedModel: string;
  genModel: string;
  docCount: number;
  docDims: number;
  demoDims: number;
  demoCount: number;
};

export type DocListItem = { id: number; title: string; preview: string; words: number };
export type DocInsertResponse = { ids: number[]; chunks: number; dims: number } | { error: string };
export type DocAskResponse =
  | {
      answer: string;
      model: string;
      contexts: Array<{ id: number; title: string; text: string; distance: number }>;
      docCount: number;
    }
  | { error: string };

export type DocSearchResponse =
  | { contexts: Array<{ id: number; title: string; distance: number }> }
  | { error: string };
```

- [ ] **Step 2: Create fetch wrapper with AbortController**

Create `client/src/api/client.ts`:

```ts
export type ApiError = { message: string; status?: number };

export class ApiClient {
  constructor(private baseUrl: string) {}

  async getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { method: "GET", signal });
    if (!res.ok) throw { message: `Request failed: ${res.status}`, status: res.status } satisfies ApiError;
    return (await res.json()) as T;
  }

  async postJson<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal
    });
    if (!res.ok) throw { message: `Request failed: ${res.status}`, status: res.status } satisfies ApiError;
    return (await res.json()) as T;
  }

  async deleteJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { method: "DELETE", signal });
    if (!res.ok) throw { message: `Request failed: ${res.status}`, status: res.status } satisfies ApiError;
    return (await res.json()) as T;
  }
}
```

- [ ] **Step 3: Implement endpoint helpers**

Create `client/src/api/endpoints.ts`:

```ts
import { ApiClient } from "./client";
import type {
  BenchmarkResponse,
  DocAskResponse,
  DocInsertResponse,
  DocListItem,
  DocSearchResponse,
  HnswInfoResponse,
  Metric,
  SearchAlgo,
  SearchResponse,
  StatusResponse,
  DemoItem
} from "./types";

export function createApi(baseUrl: string) {
  const c = new ApiClient(baseUrl);
  return {
    items: (signal?: AbortSignal) => c.getJson<DemoItem[]>("/items", signal),
    stats: (signal?: AbortSignal) => c.getJson<any>("/stats", signal),
    status: (signal?: AbortSignal) => c.getJson<StatusResponse>("/status", signal),
    hnswInfo: (signal?: AbortSignal) => c.getJson<HnswInfoResponse>("/hnsw-info", signal),
    search: (q: number[], k: number, metric: Metric, algo: SearchAlgo, signal?: AbortSignal) =>
      c.getJson<SearchResponse>(
        `/search?v=${encodeURIComponent(q.join(","))}&k=${k}&metric=${metric}&algo=${algo}`,
        signal
      ),
    benchmark: (q: number[], k: number, metric: Metric, signal?: AbortSignal) =>
      c.getJson<BenchmarkResponse>(
        `/benchmark?v=${encodeURIComponent(q.join(","))}&k=${k}&metric=${metric}`,
        signal
      ),
    insertVector: (metadata: string, category: string, embedding: number[], signal?: AbortSignal) =>
      c.postJson<{ id: number } | { error: string }>("/insert", { metadata, category, embedding }, signal),
    deleteVector: (id: number, signal?: AbortSignal) =>
      c.deleteJson<{ ok: boolean }>(`/delete/${id}`, signal),
    docList: (signal?: AbortSignal) => c.getJson<DocListItem[]>("/doc/list", signal),
    docInsert: (title: string, text: string, signal?: AbortSignal) =>
      c.postJson<DocInsertResponse>("/doc/insert", { title, text }, signal),
    docDelete: (id: number, signal?: AbortSignal) =>
      c.deleteJson<{ ok: boolean }>(`/doc/delete/${id}`, signal),
    docSearch: (question: string, k: number, signal?: AbortSignal) =>
      c.postJson<DocSearchResponse>("/doc/search", { question, k }, signal),
    docAsk: (question: string, k: number, signal?: AbortSignal) =>
      c.postJson<DocAskResponse>("/doc/ask", { question, k }, signal)
  };
}
```

- [ ] **Step 4: Verify build**

Run:

```bash
cd /workspace/client
npm run build
```

Expected: PASS

---

### Task 2: Implement App Shell (Layout + Top Bar + Tabs)

**Files:**
- Create: `client/src/components/layout/AppLayout.tsx`
- Create: `client/src/components/layout/TopBar.tsx`
- Create: `client/src/components/layout/WorkspaceTabs.tsx`
- Modify: `client/src/App.tsx`
- Modify: `client/src/styles.css`

- [ ] **Step 1: Create AppLayout and TopBar**

Create `client/src/components/layout/AppLayout.tsx`:

```tsx
import type { ReactNode } from "react";

export function AppLayout(props: { top: ReactNode; left: ReactNode; right: ReactNode; bottom?: ReactNode }) {
  return (
    <div className="app">
      <div className="appTop">{props.top}</div>
      <div className="appMain">
        <div className="appLeft">{props.left}</div>
        <div className="appRight">{props.right}</div>
      </div>
      {props.bottom ? <div className="appBottom">{props.bottom}</div> : null}
    </div>
  );
}
```

Create `client/src/components/layout/TopBar.tsx`:

```tsx
import type { StatusResponse } from "../../api/types";

export function TopBar(props: { status: StatusResponse | null; statsLabel: string }) {
  const ollama = props.status?.ollamaAvailable ? "Online" : "Offline";
  const badge = props.status?.ollamaAvailable ? "ok" : "err";
  return (
    <header>
      <h1>VectorDB</h1>
      <span className="badge hl">HNSW</span>
      <span className="badge">KD-TREE</span>
      <span className="badge">BRUTE FORCE</span>
      <span className={`badge ${badge}`}>OLLAMA: {ollama}</span>
      <span id="statsLabel">{props.statsLabel}</span>
    </header>
  );
}
```

- [ ] **Step 2: Create WorkspaceTabs**

Create `client/src/components/layout/WorkspaceTabs.tsx`:

```tsx
import { useState, type ReactNode } from "react";

export type TabKey = "search" | "docs" | "ai";

export function WorkspaceTabs(props: {
  search: ReactNode;
  docs: ReactNode;
  ai: ReactNode;
}) {
  const [tab, setTab] = useState<TabKey>("search");

  return (
    <div className="workspace">
      <div className="tabs">
        <div className={`tab ${tab === "search" ? "on" : ""}`} onClick={() => setTab("search")}>SEARCH</div>
        <div className={`tab ${tab === "docs" ? "on" : ""}`} onClick={() => setTab("docs")}>DOCUMENTS</div>
        <div className={`tab ${tab === "ai" ? "on" : ""}`} onClick={() => setTab("ai")}>ASK AI</div>
      </div>
      <div className={`tab-content ${tab === "search" ? "on" : ""}`}>{props.search}</div>
      <div className={`tab-content ${tab === "docs" ? "on" : ""}`}>{props.docs}</div>
      <div className={`tab-content ${tab === "ai" ? "on" : ""}`}>{props.ai}</div>
    </div>
  );
}
```

- [ ] **Step 3: Update App to use shell**

Modify `client/src/App.tsx` to load status/items initially, then render the new shell (even before feature tabs are implemented, render placeholder content).

- [ ] **Step 4: Run dev server**

Run:

```bash
cd /workspace/client
npm run dev -- --host 0.0.0.0 --port 5173
```

Expected: Page renders with new layout.

---

### Task 3: Implement Search Tab (Controls + Results + Benchmark + Layers)

**Files:**
- Create: `client/src/components/search/*` (listed above)
- Create: `client/src/lib/textToEmbedding.ts`
- Create: `client/src/lib/format.ts`

- [ ] **Step 1: Port textToEmbedding (16D)**

Create `client/src/lib/textToEmbedding.ts` (port logic from current legacy UI).

- [ ] **Step 2: Implement SearchControls**

Inputs:
- query string
- algo (HNSW/KD/BRUTE)
- metric
- k

Outputs:
- "Search" action calls `/search`
- "Compare all algos" calls `/benchmark`

- [ ] **Step 3: Implement SearchResults**

Supports:
- shows result cards with distance + category chip
- delete action calls `/delete/:id` then refreshes `/items` + `/hnsw-info`

- [ ] **Step 4: Implement HnswLayersPanel**

Calls `/hnsw-info` and renders layers bars.

- [ ] **Step 5: Implement BenchmarkPanel**

Calls `/benchmark` and renders bars.

- [ ] **Step 6: Verify manual flow**

With backend running:
- search returns results
- delete works
- benchmark works
- layers load

---

### Task 4: Implement ScatterCanvas + PCA (Left Visualization)

**Files:**
- Create: `client/src/components/visual/ScatterCanvas.tsx`
- Create: `client/src/lib/pca.ts`

- [ ] **Step 1: Implement pca2D**

Create `client/src/lib/pca.ts` and port PCA logic.

- [ ] **Step 2: Implement canvas rendering**

Inputs:
- `items` (from `/items`)
- `hitIds`
- `queryPt` (derived)

Outputs:
- canvas draw loop
- tooltip state lifted to React

- [ ] **Step 3: Verify performance**

Resize, hover, search highlight should remain smooth.

---

### Task 5: Documents Tab

**Files:**
- Create: `client/src/components/docs/*`

- [ ] **Step 1: OllamaStatusCard**

Uses `/status`.

- [ ] **Step 2: DocumentInsertForm**

Calls `/doc/insert` and shows success/failure; refresh list.

- [ ] **Step 3: DocumentList**

Calls `/doc/list`; delete uses `/doc/delete/:id`; refresh list.

---

### Task 6: Ask AI Tab (RAG)

**Files:**
- Create: `client/src/components/ai/*`
- Create: `client/src/hooks/useHotkeys.ts`

- [ ] **Step 1: Ask form**

Calls `/doc/ask`.

- [ ] **Step 2: Context highlight**

In parallel call `/doc/search` to populate `hitIds` for the scatter.

- [ ] **Step 3: ChatTranscript**

Typewriter answer + context chips expand/collapse.

---

### Task 7: Global UX (Toasts + Loading + Confirmations)

**Files:**
- Create: `client/src/components/ui/Toast.tsx`
- Create: `client/src/components/ui/Spinner.tsx`

- [ ] **Step 1: Toast system**

Global toast queue in App.

- [ ] **Step 2: Replace alerts + improve error messages**

Search, benchmark, docs, ask.

- [ ] **Step 3: Confirm delete actions**

Vector delete and doc delete.

---

### Task 8: Clean-up Legacy UI

**Files:**
- Modify: `client/src/App.tsx`
- Delete: `client/src/legacyUi.ts`

- [ ] **Step 1: Remove remaining legacy references**

- [ ] **Step 2: Build + run**

```bash
cd /workspace/client
npm run build
```

Expected: PASS

---

## Plan Self-Review

- Spec coverage: layout + styling + UX + performance + full parity flows are included across Tasks 2–8.
- Placeholder scan: no “TBD” steps; code stubs provided for core infrastructure pieces.
- Type consistency: API types and endpoints map to existing backend fields.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-04-ui-redesign-dashboard.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?


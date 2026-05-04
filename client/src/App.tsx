import { useEffect, useMemo, useRef, useState } from "react";
import { createApi } from "./api/endpoints";
import type {
  BenchmarkResponse,
  DocAskResponse,
  DocListItem,
  HnswInfoResponse,
  Metric,
  SearchAlgo,
  SearchHit,
  StatusResponse,
  DemoItem
} from "./api/types";
import { AppLayout } from "./components/layout/AppLayout";
import { TopBar } from "./components/layout/TopBar";
import { WorkspaceTabs } from "./components/layout/WorkspaceTabs";
import { AskAiTab } from "./components/ai/AskAiTab";
import { DocumentsTab } from "./components/docs/DocumentsTab";
import { SearchTab } from "./components/search/SearchTab";
import { ScatterCanvas } from "./components/visual/ScatterCanvas";
import { textToEmbedding } from "./lib/textToEmbedding";

const EMPTY_EMB = new Array(16).fill(0.08);

export default function App() {
  const apiBase = (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:8080";
  const api = useMemo(() => createApi(apiBase), [apiBase]);

  const [items, setItems] = useState<DemoItem[]>([]);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [hnswInfo, setHnswInfo] = useState<HnswInfoResponse | null>(null);
  const [docs, setDocs] = useState<DocListItem[]>([]);

  const [query, setQuery] = useState("");
  const [algo, setAlgo] = useState<SearchAlgo>("hnsw");
  const [metric, setMetric] = useState<Metric>("cosine");
  const [k, setK] = useState(5);

  const [embedding, setEmbedding] = useState<number[]>(EMPTY_EMB);
  const [latencyUs, setLatencyUs] = useState<number | null>(null);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [bench, setBench] = useState<BenchmarkResponse | null>(null);

  const [hitIds, setHitIds] = useState<Set<number>>(new Set());
  const [activeIds, setActiveIds] = useState<number[]>([]);

  const [docInsertBusy, setDocInsertBusy] = useState(false);
  const [docInsertStatus, setDocInsertStatus] = useState<string | null>(null);

  const [askBusy, setAskBusy] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const [askResponse, setAskResponse] = useState<DocAskResponse | null>(null);

  const refreshAllAbort = useRef<AbortController | null>(null);
  const searchAbort = useRef<AbortController | null>(null);
  const askAbort = useRef<AbortController | null>(null);

  const refreshAll = async () => {
    refreshAllAbort.current?.abort();
    const ac = new AbortController();
    refreshAllAbort.current = ac;
    try {
      const [it, st, hi, dl] = await Promise.all([
        api.items(ac.signal),
        api.status(ac.signal),
        api.hnswInfo(ac.signal),
        api.docList(ac.signal)
      ]);
      setItems(it);
      setStatus(st);
      setHnswInfo(hi);
      setDocs(dl);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      throw e;
    }
  };

  useEffect(() => {
    void refreshAll();
    return () => {
      refreshAllAbort.current?.abort();
      searchAbort.current?.abort();
      askAbort.current?.abort();
    };
  }, [apiBase]);

  const statsLabel = `${items.length} vectors · 16 dims`;

  const runSearch = async () => {
    const text = query.trim();
    if (!text) return;
    searchAbort.current?.abort();
    const ac = new AbortController();
    searchAbort.current = ac;

    const emb = textToEmbedding(text);
    setEmbedding(emb);
    const out = await api.search(emb, k, metric, algo, ac.signal);
    setLatencyUs(out.latencyUs);
    setResults(out.results);
    const ids = out.results.map((r) => r.id);
    setHitIds(new Set(ids));
    setActiveIds(ids);
  };

  const runBenchmark = async () => {
    const text = query.trim() || "binary tree algorithm";
    const emb = textToEmbedding(text);
    setEmbedding(emb);
    const out = await api.benchmark(emb, 5, metric);
    setBench(out);
  };

  const deleteVector = async (id: number) => {
    const ok = globalThis.confirm?.("Delete this vector?") ?? true;
    if (!ok) return;
    await api.deleteVector(id);
    const it = await api.items();
    setItems(it);
    setHnswInfo(await api.hnswInfo());
    setResults((r) => r.filter((x) => x.id !== id));
    setHitIds((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
  };

  const insertVector = async (metadata: string, category: string) => {
    const emb16 = textToEmbedding(`${metadata} ${category}`);
    const res = await api.insertVector(metadata, category, emb16);
    if ("error" in res) return;
    const it = await api.items();
    setItems(it);
    setHnswInfo(await api.hnswInfo());
  };

  const insertDocument = async (title: string, text: string) => {
    if (!title || !text) {
      setDocInsertStatus("⚠ Need both a title and text.");
      return;
    }
    setDocInsertBusy(true);
    setDocInsertStatus("Calling Ollama nomic-embed-text…");
    try {
      const res = await api.docInsert(title, text);
      if ("error" in res) {
        setDocInsertStatus(`✗ ${res.error}`);
        return;
      }
      setDocInsertStatus(`✓ Inserted ${res.chunks} chunk(s) · ${res.dims}D embeddings`);
      const emb16 = textToEmbedding(`${title} ${text}`);
      await api.insertVector(title, "doc", emb16);
      const [dl, st, it, hi] = await Promise.all([api.docList(), api.status(), api.items(), api.hnswInfo()]);
      setDocs(dl);
      setStatus(st);
      setItems(it);
      setHnswInfo(hi);
    } finally {
      setDocInsertBusy(false);
    }
  };

  const deleteDoc = async (id: number) => {
    const ok = globalThis.confirm?.("Delete this document chunk?") ?? true;
    if (!ok) return;
    await api.docDelete(id);
    setDocs(await api.docList());
    setStatus(await api.status());
  };

  const askAi = async (question: string, k: number) => {
    askAbort.current?.abort();
    const ac = new AbortController();
    askAbort.current = ac;

    setAskBusy(true);
    setAskResponse(null);
    setLastQuestion(question);

    api
      .docSearch(question, k, ac.signal)
      .then((r) => {
        if ("error" in r) return;
        const mapped = r.contexts
          .map((c) => {
            const pt = items.find((it) => it.category === "doc" && String(c.title).startsWith(it.metadata));
            return pt?.id ?? null;
          })
          .filter((x): x is number => x != null);
        if (mapped.length) {
          setHitIds(new Set(mapped));
          setActiveIds(mapped);
          return;
        }
        const emb16 = textToEmbedding(question);
        return api.search(emb16, 3, "cosine", "hnsw", ac.signal).then((s) => {
          const ids = s.results.map((x) => x.id);
          setHitIds(new Set(ids));
          setActiveIds(ids);
        });
      })
      .catch(() => {});

    try {
      const res = await api.docAsk(question, k, ac.signal);
      setAskResponse(res);
    } finally {
      setAskBusy(false);
    }
  };

  return (
    <AppLayout
      top={<TopBar status={status} statsLabel={statsLabel} />}
      left={
        <>
          <div className="cardHeader">
            <div className="cardTitle">Semantic Space</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Hover points · search highlights nearest neighbors</div>
          </div>
          <div style={{ position: "absolute", inset: "44px 0 0 0" }}>
            <ScatterCanvas items={items} hitIds={hitIds} activeIds={activeIds} />
          </div>
        </>
      }
      right={
        <WorkspaceTabs
          search={
            <SearchTab
              query={query}
              onQueryChange={setQuery}
              algo={algo}
              onAlgoChange={setAlgo}
              metric={metric}
              onMetricChange={setMetric}
              k={k}
              onKChange={setK}
              embedding={embedding}
              latencyUs={latencyUs}
              results={results}
              onSearch={() => void runSearch()}
              onBenchmark={() => void runBenchmark()}
              onInsertVector={(m, c) => void insertVector(m, c)}
              onDelete={(id) => void deleteVector(id)}
              bench={bench}
              hnswInfo={hnswInfo}
              busy={false}
            />
          }
          docs={
            <DocumentsTab
              status={status}
              docs={docs}
              onRefresh={() => void refreshAll()}
              onInsert={insertDocument}
              onDelete={deleteDoc}
              busyInsert={docInsertBusy}
              insertStatusText={docInsertStatus}
            />
          }
          ai={<AskAiTab onAsk={askAi} busy={askBusy} response={askResponse} lastQuestion={lastQuestion} />}
        />
      }
    />
  );
}

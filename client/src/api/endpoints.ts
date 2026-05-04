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
    deleteVector: (id: number, signal?: AbortSignal) => c.deleteJson<{ ok: boolean }>(`/delete/${id}`, signal),
    docList: (signal?: AbortSignal) => c.getJson<DocListItem[]>("/doc/list", signal),
    docInsert: (title: string, text: string, signal?: AbortSignal) =>
      c.postJson<DocInsertResponse>("/doc/insert", { title, text }, signal),
    docDelete: (id: number, signal?: AbortSignal) => c.deleteJson<{ ok: boolean }>(`/doc/delete/${id}`, signal),
    docSearch: (question: string, k: number, signal?: AbortSignal) =>
      c.postJson<DocSearchResponse>("/doc/search", { question, k }, signal),
    docAsk: (question: string, k: number, signal?: AbortSignal) =>
      c.postJson<DocAskResponse>("/doc/ask", { question, k }, signal)
  };
}


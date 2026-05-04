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

export type DocInsertResponse =
  | { ids: number[]; chunks: number; dims: number }
  | { error: string };

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


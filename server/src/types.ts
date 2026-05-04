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


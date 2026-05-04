import { useState } from "react";
import type { Metric, SearchAlgo } from "../../api/types";

export function SearchControls(props: {
  query: string;
  onQueryChange: (v: string) => void;
  algo: SearchAlgo;
  onAlgoChange: (v: SearchAlgo) => void;
  metric: Metric;
  onMetricChange: (v: Metric) => void;
  k: number;
  onKChange: (v: number) => void;
  onSearch: () => void;
  onBenchmark: () => void;
  onInsertVector: (metadata: string, category: string) => void;
  searchDisabled?: boolean;
}) {
  const [meta, setMeta] = useState("");
  const [cat, setCat] = useState("cs");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div className="sec">Query (Demo Vectors)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            type="text"
            value={props.query}
            onChange={(e) => props.onQueryChange(e.target.value)}
            placeholder="binary tree, sushi, basketball…"
            onKeyDown={(e) => {
              if (e.key === "Enter") props.onSearch();
            }}
          />
          <button className="btn-p" onClick={props.onSearch} disabled={props.searchDisabled}>
            ⚡ SEARCH
          </button>
        </div>
      </div>

      <div>
        <div className="sec">Algorithm</div>
        <div className="algo-row">
          <button
            className={`algo-btn ${props.algo === "hnsw" ? "on" : ""}`}
            onClick={() => props.onAlgoChange("hnsw")}
          >
            HNSW
          </button>
          <button
            className={`algo-btn ${props.algo === "kdtree" ? "on" : ""}`}
            onClick={() => props.onAlgoChange("kdtree")}
          >
            KD-TREE
          </button>
          <button
            className={`algo-btn ${props.algo === "bruteforce" ? "on" : ""}`}
            onClick={() => props.onAlgoChange("bruteforce")}
          >
            BRUTE
          </button>
        </div>
      </div>

      <div>
        <div className="sec">Distance Metric</div>
        <select value={props.metric} onChange={(e) => props.onMetricChange(e.target.value as Metric)}>
          <option value="cosine">Cosine Similarity</option>
          <option value="euclidean">Euclidean Distance</option>
          <option value="manhattan">Manhattan Distance</option>
        </select>
      </div>

      <div>
        <div className="sec">
          Top-K: <span>{props.k}</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={props.k}
          onChange={(e) => props.onKChange(Number(e.target.value))}
        />
      </div>

      <div>
        <div className="sec">Benchmark</div>
        <button className="btn-s" onClick={props.onBenchmark}>
          ▶ COMPARE ALL ALGOS
        </button>
      </div>

      <div>
        <div className="sec">Insert Demo Vector</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input type="text" value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="Description…" />
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="cs">CS / Algorithms</option>
            <option value="math">Mathematics</option>
            <option value="food">Food &amp; Cooking</option>
            <option value="sports">Sports &amp; Games</option>
          </select>
          <button
            className="btn-s"
            onClick={() => {
              const m = String(meta).trim();
              if (!m) return;
              props.onInsertVector(m, String(cat));
              setMeta("");
            }}
          >
            + INSERT
          </button>
        </div>
      </div>
    </div>
  );
}

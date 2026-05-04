import type { BenchmarkResponse, HnswInfoResponse, Metric, SearchAlgo, SearchHit } from "../../api/types";
import { formatLatency } from "../../lib/format";
import { VectorBars } from "../visual/VectorBars";
import { BenchmarkPanel } from "./BenchmarkPanel";
import { HnswLayersPanel } from "./HnswLayersPanel";
import { SearchControls } from "./SearchControls";
import { SearchResults } from "./SearchResults";

export function SearchTab(props: {
  query: string;
  onQueryChange: (v: string) => void;
  algo: SearchAlgo;
  onAlgoChange: (v: SearchAlgo) => void;
  metric: Metric;
  onMetricChange: (v: Metric) => void;
  k: number;
  onKChange: (v: number) => void;
  embedding: number[];
  latencyUs: number | null;
  results: SearchHit[];
  onSearch: () => void;
  onBenchmark: () => void;
  onInsertVector: (metadata: string, category: string) => void;
  onDelete: (id: number) => void;
  bench: BenchmarkResponse | null;
  hnswInfo: HnswInfoResponse | null;
  busy?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SearchControls
        query={props.query}
        onQueryChange={props.onQueryChange}
        algo={props.algo}
        onAlgoChange={props.onAlgoChange}
        metric={props.metric}
        onMetricChange={props.onMetricChange}
        k={props.k}
        onKChange={props.onKChange}
        onSearch={props.onSearch}
        onBenchmark={props.onBenchmark}
        onInsertVector={props.onInsertVector}
        searchDisabled={props.busy}
      />

      <div>
        <div className="sec">Search Latency</div>
        <div className="lat-big">{props.latencyUs == null ? "—" : formatLatency(props.latencyUs)}</div>
        <div className="lat-sub">
          {props.latencyUs == null ? "No query yet" : `${props.algo.toUpperCase()} · ${props.metric} · k=${props.k}`}
        </div>
      </div>

      <div>
        <div className="sec">Top Matches</div>
        <SearchResults results={props.results} onDelete={props.onDelete} />
      </div>

      <div>
        <div className="sec">Query Embedding (16D)</div>
        <VectorBars embedding={props.embedding} />
      </div>

      <BenchmarkPanel data={props.bench} />
      <HnswLayersPanel info={props.hnswInfo} />
    </div>
  );
}

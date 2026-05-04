import type { BenchmarkResponse } from "../../api/types";
import { formatLatency } from "../../lib/format";

export function BenchmarkPanel(props: { data: BenchmarkResponse | null }) {
  if (!props.data) return null;
  const d = props.data;
  const mx = Math.max(d.bruteforceUs, d.kdtreeUs, d.hnswUs, 1);
  const rows = [
    { lbl: "Brute Force", us: d.bruteforceUs, col: "#f38ba8" },
    { lbl: "KD-Tree", us: d.kdtreeUs, col: "#89dceb" },
    { lbl: "HNSW", us: d.hnswUs, col: "#b388ff" }
  ];

  return (
    <div>
      <div className="sec">Algorithm Comparison</div>
      <div className="bench">
        {rows.map((r) => {
          const pct = Math.max((r.us / mx) * 100, 2);
          return (
            <div key={r.lbl} className="brow">
              <div className="blabel">
                <span style={{ color: r.col }}>{r.lbl}</span>
                <span style={{ color: "var(--muted)" }}>{formatLatency(r.us)}</span>
              </div>
              <div className="btrack">
                <div className="bfill" style={{ width: `${pct}%`, background: r.col }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


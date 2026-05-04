import type { HnswInfoResponse } from "../../api/types";

export function HnswLayersPanel(props: { info: HnswInfoResponse | null }) {
  const d = props.info;
  if (!d) {
    return (
      <div>
        <div className="sec">HNSW Graph Layers</div>
        <div style={{ color: "var(--muted)", fontSize: 11 }}>Loading…</div>
      </div>
    );
  }
  const maxN = d.nodesPerLayer?.[0] || 1;
  return (
    <div>
      <div className="sec">HNSW Graph Layers</div>
      <div className="layers">
        {d.nodesPerLayer.map((cnt, lyr) => {
          const pct = Math.max((cnt / maxN) * 100, 2);
          const edg = d.edgesPerLayer?.[lyr] || 0;
          return (
            <div key={lyr} className="lrow">
              <div className="lnum">L{lyr}</div>
              <div className="ltrack">
                <div className="lfill" style={{ width: `${pct}%` }} />
              </div>
              <div className="lcount">
                {cnt}n · {edg}e
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


import type { SearchHit } from "../../api/types";

const COL: Record<string, string> = {
  cs: "#00d9ff",
  math: "#b388ff",
  food: "#ffb74d",
  sports: "#69f0ae",
  doc: "#a6e3a1",
  default: "#90a4ae"
};

export function SearchResults(props: { results: SearchHit[]; onDelete: (id: number) => void }) {
  if (!props.results.length) {
    return <div style={{ color: "var(--muted)", fontSize: 11 }}>Run a search to see results…</div>;
  }

  return (
    <div className="results">
      {props.results.map((r, i) => {
        const col = COL[r.category] || COL.default;
        return (
          <div key={r.id} className="rcard">
            <div className="rrank">#{i + 1} NEAREST</div>
            <div className="rmeta">{r.metadata}</div>
            <div className="rfoot">
              <span className="rcat" style={{ background: `${col}18`, color: col, border: `1px solid ${col}44` }}>
                {String(r.category).toUpperCase()}
              </span>
              <span className="rdist">dist: {Number(r.distance).toFixed(5)}</span>
              <button className="del" onClick={() => props.onDelete(r.id)}>
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}


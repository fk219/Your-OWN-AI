import type { DocListItem } from "../../api/types";

export function DocumentList(props: { docs: DocListItem[]; onDelete: (id: number) => void }) {
  if (!props.docs.length) {
    return <div style={{ color: "var(--muted)", fontSize: 11 }}>No documents yet. Insert some above.</div>;
  }
  return (
    <div className="doc-list">
      {props.docs.map((d) => (
        <div key={d.id} className="dcard">
          <div className="dcard-title">{d.title}</div>
          <div className="dcard-preview">{d.preview}</div>
          <div className="dcard-foot">
            <span className="dcard-words">{d.words} words</span>
            <button className="del" onClick={() => props.onDelete(d.id)}>
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}


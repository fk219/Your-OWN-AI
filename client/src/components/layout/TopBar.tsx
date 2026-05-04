import type { StatusResponse } from "../../api/types";

export function TopBar(props: { status: StatusResponse | null; statsLabel: string }) {
  const ollama = props.status?.ollamaAvailable ? "Online" : "Offline";
  const badge = props.status?.ollamaAvailable ? "ok" : "err";
  return (
    <header className="topbar">
      <div className="topbarLeft">
        <h1 className="topbarTitle">VectorDB</h1>
        <div className="topbarSub">Vector Search + RAG Playground</div>
      </div>
      <div className="topbarCenter">
        <span className="badge hl">HNSW</span>
        <span className="badge">KD-TREE</span>
        <span className="badge">BRUTE FORCE</span>
        <span className={`badge ${badge}`}>OLLAMA: {ollama}</span>
      </div>
      <div className="topbarRight">
        <div className="topbarStats">{props.statsLabel}</div>
      </div>
    </header>
  );
}


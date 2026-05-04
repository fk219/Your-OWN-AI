import type { StatusResponse } from "../../api/types";

export function OllamaStatusCard(props: { status: StatusResponse | null }) {
  const s = props.status;
  if (!s) return <div className="ollama-status">Checking…</div>;
  if (s.ollamaAvailable) {
    return (
      <div className="ollama-status ok">
        <span style={{ color: "var(--green)" }}>● Online</span>
        <br />
        Embed: <span style={{ color: "var(--accent)" }}>{s.embedModel}</span>
        <br />
        Generate: <span style={{ color: "var(--accent)" }}>{s.genModel}</span>
        <br />
        Dims: <span style={{ color: "var(--muted)" }}>{s.docDims || "(first insert sets this)"}</span>
        <br />
        Documents: <span style={{ color: "var(--text)" }}>{s.docCount}</span>
      </div>
    );
  }
  return (
    <div className="ollama-status err">
      <span style={{ color: "var(--red)" }}>● Offline</span>
      <br />
      <br />
      To enable RAG features:
      <br />
      <span style={{ color: "var(--muted)" }}>
        1. Install from ollama.com
        <br />
        2. ollama pull nomic-embed-text
        <br />
        3. ollama pull llama3.2
      </span>
    </div>
  );
}


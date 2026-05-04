import { useState } from "react";

export function DocumentInsertForm(props: {
  onInsert: (title: string, text: string) => Promise<void>;
  busy?: boolean;
  statusText: string | null;
}) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title / topic…" />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          "Paste your notes, textbook excerpt, lecture content…\n\nLong text is automatically split into overlapping chunks and each chunk gets its own real embedding via Ollama's nomic-embed-text model."
        }
      />
      <button
        className="btn-g"
        disabled={props.busy}
        onClick={() => {
          props.onInsert(title.trim(), text.trim());
        }}
      >
        {props.busy ? "Embedding…" : "⚡ EMBED & INSERT"}
      </button>
      <div style={{ fontSize: 11, color: "var(--muted)" }}>{props.statusText ?? ""}</div>
    </div>
  );
}


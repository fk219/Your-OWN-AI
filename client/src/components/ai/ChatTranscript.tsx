import { useEffect, useState } from "react";
import type { DocAskResponse } from "../../api/types";

export function ChatTranscript(props: { question: string; response: DocAskResponse | null }) {
  const [typed, setTyped] = useState("");

  const resp = props.response;
  const ok = resp != null && !("error" in resp);
  const full = ok ? resp.answer : "";

  useEffect(() => {
    setTyped("");
    if (!ok) return;
    let i = 0;
    const timer = setInterval(() => {
      i += 3;
      setTyped(full.slice(0, i));
      if (i >= full.length) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, [full, ok]);

  const [open, setOpen] = useState<Record<number, boolean>>({});
  useEffect(() => setOpen({}), [props.response]);

  if (!props.question) {
    return <div style={{ color: "var(--muted)", fontSize: 11 }}>Ask a question about your inserted documents…</div>;
  }

  return (
    <div className="chat-history">
      <div className="chat-q">{props.question}</div>

      <div className="chat-a">
        {resp == null ? (
          <div className="thinking">
            <div className="spinner" />
            Retrieving context & generating answer…
          </div>
        ) : "error" in resp ? (
          <>
            <div className="chat-a-label">ERROR</div>
            <div className="chat-a-text" style={{ color: "var(--red)" }}>
              {resp.error}
            </div>
          </>
        ) : (
          <>
            <div className="chat-a-label">🤖 {resp.model}</div>
            <div className={`chat-a-text ${typed.length < full.length ? "typing" : ""}`}>{typed}</div>
            <div className="chat-ctx">
              <div className="chat-ctx-label">RETRIEVED CONTEXT ({resp.contexts.length} chunks)</div>
              {resp.contexts.map((c, idx: number) => (
                <div key={c.id}>
                  <span className="ctx-chip" onClick={() => setOpen((s) => ({ ...s, [idx]: !s[idx] }))}>
                    #{idx + 1} {c.title} · {Number(c.distance).toFixed(3)}
                  </span>
                  <div className="ctx-expand" style={{ display: open[idx] ? "block" : "none" }}>
                    {c.text}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

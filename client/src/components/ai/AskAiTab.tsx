import { useState } from "react";
import type { DocAskResponse } from "../../api/types";
import { ChatTranscript } from "./ChatTranscript";

export function AskAiTab(props: {
  onAsk: (question: string, k: number) => Promise<void>;
  busy?: boolean;
  response: DocAskResponse | null;
  lastQuestion: string;
}) {
  const [question, setQuestion] = useState("");
  const [k, setK] = useState(3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div className="sec">Ask a Question</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            placeholder={"What is dynamic programming?\nExplain the main idea of HNSW.\nHow does the recipe differ from…"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e as any).ctrlKey) {
                const q = question.trim();
                if (!q) return;
                void props.onAsk(q, k).then(() => setQuestion(""));
              }
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <select value={k} onChange={(e) => setK(Number(e.target.value))} style={{ width: "auto", flexShrink: 0 }}>
              <option value={2}>Top 2</option>
              <option value={3}>Top 3</option>
              <option value={5}>Top 5</option>
            </select>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              disabled={props.busy}
              onClick={() => {
                const q = question.trim();
                if (!q) return;
                void props.onAsk(q, k).then(() => setQuestion(""));
              }}
            >
              {props.busy ? "Thinking…" : "🤖 ASK AI"}
            </button>
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)" }}>Uses your inserted documents as context. Answers come from the local LLM.</div>
        </div>
      </div>

      <div>
        <div className="sec">Conversation</div>
        <ChatTranscript question={props.lastQuestion} response={props.response} />
      </div>
    </div>
  );
}


import { useState, type ReactNode } from "react";

export type TabKey = "search" | "docs" | "ai";

export function WorkspaceTabs(props: { search: ReactNode; docs: ReactNode; ai: ReactNode }) {
  const [tab, setTab] = useState<TabKey>("search");

  return (
    <div className="workspace">
      <div className="tabs">
        <button className={`tab ${tab === "search" ? "on" : ""}`} onClick={() => setTab("search")}>
          SEARCH
        </button>
        <button className={`tab ${tab === "docs" ? "on" : ""}`} onClick={() => setTab("docs")}>
          DOCUMENTS
        </button>
        <button className={`tab ${tab === "ai" ? "on" : ""}`} onClick={() => setTab("ai")}>
          ASK AI
        </button>
      </div>
      <div className={`tab-content ${tab === "search" ? "on" : ""}`}>{props.search}</div>
      <div className={`tab-content ${tab === "docs" ? "on" : ""}`}>{props.docs}</div>
      <div className={`tab-content ${tab === "ai" ? "on" : ""}`}>{props.ai}</div>
    </div>
  );
}


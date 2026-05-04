import type { DocListItem, StatusResponse } from "../../api/types";
import { DocumentInsertForm } from "./DocumentInsertForm";
import { DocumentList } from "./DocumentList";
import { OllamaStatusCard } from "./OllamaStatusCard";

export function DocumentsTab(props: {
  status: StatusResponse | null;
  docs: DocListItem[];
  onRefresh: () => void;
  onInsert: (title: string, text: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  busyInsert?: boolean;
  insertStatusText: string | null;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div className="sec">Ollama Status</div>
        <OllamaStatusCard status={props.status} />
      </div>

      <div>
        <div className="sec">Insert Document</div>
        <DocumentInsertForm busy={props.busyInsert} statusText={props.insertStatusText} onInsert={props.onInsert} />
      </div>

      <div>
        <div className="sec">
          Stored Documents (<span>{props.docs.length}</span>)
        </div>
        <DocumentList docs={props.docs} onDelete={(id) => void props.onDelete(id)} />
      </div>
    </div>
  );
}


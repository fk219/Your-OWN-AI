import type { ReactNode } from "react";

export function AppLayout(props: { top: ReactNode; left: ReactNode; right: ReactNode; bottom?: ReactNode }) {
  return (
    <div className="app">
      <div className="appTop">{props.top}</div>
      <div className="appMain">
        <div className="appLeft">{props.left}</div>
        <div className="appRight">{props.right}</div>
      </div>
      {props.bottom ? <div className="appBottom">{props.bottom}</div> : null}
    </div>
  );
}


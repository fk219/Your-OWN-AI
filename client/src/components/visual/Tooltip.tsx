export function Tooltip(props: { x: number; y: number; html: string; visible: boolean }) {
  if (!props.visible) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: props.x,
        top: props.y,
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: "7px 11px",
        fontSize: 11,
        pointerEvents: "none",
        maxWidth: 240,
        zIndex: 200,
        lineHeight: 1.5
      }}
      dangerouslySetInnerHTML={{ __html: props.html }}
    />
  );
}


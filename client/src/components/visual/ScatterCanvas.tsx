import { useMemo, useState } from "react";
import type { DemoItem } from "../../api/types";
import { pca2D } from "../../lib/pca";
import { Tooltip } from "./Tooltip";

const COL: Record<string, string> = {
  cs: "#00d9ff",
  math: "#b388ff",
  food: "#ffb74d",
  sports: "#69f0ae",
  doc: "#a6e3a1",
  default: "#90a4ae"
};

type Point = { x: number; y: number; item: DemoItem };

type ScatterQueryPoint = { x: number; y: number } | null;

export function ScatterCanvas(props: { items: DemoItem[]; hitIds: Set<number>; activeIds: number[] }) {
  const css = typeof window !== "undefined" ? getComputedStyle(document.documentElement) : (null as any);
  const plotBg = css ? css.getPropertyValue("--plot-bg").trim() || "#07070f" : "#07070f";
  const plotGrid = css ? css.getPropertyValue("--plot-grid").trim() || "#0e0e1e" : "#0e0e1e";
  const plotAxis = css ? css.getPropertyValue("--plot-axis").trim() || "#1a1a38" : "#1a1a38";
  const plotTitle = css ? css.getPropertyValue("--plot-title").trim() || "#151530" : "#151530";
  const plotQuery = css ? css.getPropertyValue("--plot-query").trim() || "#ffffff" : "#ffffff";
  const [tip, setTip] = useState<{ visible: boolean; x: number; y: number; html: string }>({
    visible: false,
    x: 0,
    y: 0,
    html: ""
  });

  const points: Point[] = useMemo(() => {
    if (props.items.length < 2) return [];
    const coords = pca2D(props.items.map((v) => v.embedding));
    return props.items.map((item, i) => ({ x: coords[i][0], y: coords[i][1], item }));
  }, [props.items]);

  const bounds = useMemo(() => {
    if (!points.length) return { minX: -1, maxX: 1, minY: -1, maxY: 1 };
    let x0 = Infinity,
      x1 = -Infinity,
      y0 = Infinity,
      y1 = -Infinity;
    for (const p of points) {
      x0 = Math.min(x0, p.x);
      x1 = Math.max(x1, p.x);
      y0 = Math.min(y0, p.y);
      y1 = Math.max(y1, p.y);
    }
    const px = (x1 - x0) * 0.18 || 0.1;
    const py = (y1 - y0) * 0.18 || 0.1;
    return { minX: x0 - px, maxX: x1 + px, minY: y0 - py, maxY: y1 + py };
  }, [points]);

  const queryPt: ScatterQueryPoint = useMemo(() => {
    if (!props.activeIds.length) return null;
    let sx = 0;
    let sy = 0;
    let sw = 0;
    for (let i = 0; i < Math.min(3, props.activeIds.length); i++) {
      const id = props.activeIds[i];
      const pt = points.find((p) => p.item.id === id);
      if (!pt) continue;
      const w = 1 / (i + 1);
      sx += pt.x * w;
      sy += pt.y * w;
      sw += w;
    }
    if (sw <= 0) return null;
    return { x: sx / sw, y: sy / sw };
  }, [points, props.activeIds]);

  const W = 1000;
  const H = 600;
  const P = 70;
  const rx = bounds.maxX - bounds.minX || 1;
  const ry = bounds.maxY - bounds.minY || 1;
  const w2s = (wx: number, wy: number) => {
    const sx = P + ((wx - bounds.minX) / rx) * (W - 2 * P);
    const sy = H - P - ((wy - bounds.minY) / ry) * (H - 2 * P);
    return [sx, sy] as const;
  };

  return (
    <>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        style={{ display: "block" }}
        onMouseLeave={() => setTip((t) => (t.visible ? { ...t, visible: false } : t))}
      >
        <rect x={0} y={0} width={W} height={H} fill={plotBg} />

        {Array.from({ length: 9 }).map((_, i) => {
          const tx = P + (i / 8) * (W - 2 * P);
          const ty = P + (i / 8) * (H - 2 * P);
          return (
            <g key={i}>
              <line x1={tx} y1={P} x2={tx} y2={H - P} stroke={plotGrid} strokeWidth={1} />
              <line x1={P} y1={ty} x2={W - P} y2={ty} stroke={plotGrid} strokeWidth={1} />
            </g>
          );
        })}

        <text x={W / 2 - 40} y={H - 18} fill={plotAxis} fontSize={11} fontFamily="Fira Code, monospace">
          PC₁ →
        </text>
        <text
          x={18}
          y={H / 2 + 50}
          fill={plotAxis}
          fontSize={11}
          fontFamily="Fira Code, monospace"
          transform={`rotate(-90 18 ${H / 2 + 50})`}
        >
          PC₂ →
        </text>
        <text x={80} y={28} fill={plotTitle} fontSize={12} fontFamily="Fira Code, monospace">
          2D PCA Projection · Semantic Space
        </text>

        {queryPt && props.hitIds.size > 0
          ? points
              .filter((p) => props.hitIds.has(p.item.id))
              .map((p) => {
                const [qx, qy] = w2s(queryPt.x, queryPt.y);
                const [px, py] = w2s(p.x, p.y);
                return (
                  <line
                    key={`l-${p.item.id}`}
                    x1={qx}
                    y1={qy}
                    x2={px}
                    y2={py}
                    stroke="rgba(108,99,255,0.18)"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                );
              })
          : null}

        {points.map((p) => {
          const [cx, cy] = w2s(p.x, p.y);
          const col = COL[p.item.category] || COL.default;
          const isHit = props.hitIds.has(p.item.id);
          const r = isHit ? 10 : 7;
          return (
            <g
              key={p.item.id}
              onMouseMove={(e) => {
                const html = `<span style="color:${col}">[${p.item.category}]</span><br>${p.item.metadata}`;
                setTip({ visible: true, x: e.clientX + 14, y: e.clientY - 8, html });
              }}
            >
              <circle cx={cx} cy={cy} r={r * 3} fill={col + (isHit ? "22" : "14")} />
              <circle cx={cx} cy={cy} r={r} fill={col} />
              {isHit ? <circle cx={cx} cy={cy} r={r + 7} fill="none" stroke={col + "55"} strokeWidth={1.5} /> : null}
            </g>
          );
        })}

        {queryPt
          ? (() => {
              const [qx, qy] = w2s(queryPt.x, queryPt.y);
              const pts: Array<[number, number]> = [];
              for (let i = 0; i < 10; i++) {
                const a = i * (Math.PI / 5) - Math.PI / 2;
                const rr = i % 2 === 0 ? 13 : 5;
                pts.push([qx + Math.cos(a) * rr, qy + Math.sin(a) * rr]);
              }
              const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ") + " Z";
              return (
                <>
                  <path d={d} fill={plotQuery} />
                  <text x={qx + 16} y={qy + 4} fill={plotAxis} fontSize={10} fontFamily="Fira Code, monospace">
                    query
                  </text>
                </>
              );
            })()
          : null}

        {!points.length ? (
          <text x={W / 2} y={H / 2} fill={plotAxis} fontSize={13} textAnchor="middle" fontFamily="Fira Code, monospace">
            Connecting to VectorDB…
          </text>
        ) : null}
      </svg>

      <Tooltip x={tip.x} y={tip.y} html={tip.html} visible={tip.visible} />
    </>
  );
}

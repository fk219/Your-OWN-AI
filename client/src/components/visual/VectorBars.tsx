import { useEffect, useRef } from "react";

const DIM_COL = [
  "#00d9ff","#00d9ff","#00d9ff","#00d9ff",
  "#b388ff","#b388ff","#b388ff","#b388ff",
  "#ffb74d","#ffb74d","#ffb74d","#ffb74d",
  "#69f0ae","#69f0ae","#69f0ae","#69f0ae"
];

export function VectorBars(props: { embedding: number[] }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const parent = cv.parentElement as HTMLElement | null;
    if (!parent) return;

    const W = parent.clientWidth;
    cv.width = W;
    cv.height = 76;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const emb = props.embedding;
    const css = getComputedStyle(document.documentElement);
    const bg = css.getPropertyValue("--plot-bg").trim() || "#07070f";
    ctx.clearRect(0, 0, W, 76);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, 76);

    const dims = 16;
    const bw = (W - 4) / dims;
    for (let i = 0; i < dims; i++) {
      const h = (emb[i] ?? 0) * 58;
      const x = 2 + i * bw;
      const col = DIM_COL[i];
      ctx.shadowColor = col;
      ctx.shadowBlur = 5;
      ctx.fillStyle = col + "aa";
      ctx.fillRect(x + 1, 63 - h, bw - 2, h);
    }
    ctx.shadowBlur = 0;
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    const labels: Array<[string, number, string]> = [
      ["CS", 0, "#00d9ff"],
      ["MATH", 4, "#b388ff"],
      ["FOOD", 8, "#ffb74d"],
      ["SPORT", 12, "#69f0ae"]
    ];
    labels.forEach(([lbl, gi, c]) => {
      ctx.fillStyle = c + "77";
      ctx.fillText(lbl, 2 + (gi + 1.5) * bw, 74);
    });
    ctx.textAlign = "left";
  }, [props.embedding]);

  return <canvas ref={ref} style={{ display: "block", width: "100%", background: "var(--bg)", borderRadius: 5 }} />;
}

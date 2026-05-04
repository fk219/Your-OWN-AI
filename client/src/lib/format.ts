export function formatLatency(us: number) {
  if (!Number.isFinite(us)) return "—";
  if (us < 1000) return `${us} μs`;
  return `${(us / 1000).toFixed(2)} ms`;
}


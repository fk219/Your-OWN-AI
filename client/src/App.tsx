import { useEffect, useRef } from "react";
import { mountLegacyUI } from "./legacyUi";

export default function App() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const apiBase = (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:8080";
    return mountLegacyUI(ref.current, { apiBase });
  }, []);

  return <div ref={ref} />;
}

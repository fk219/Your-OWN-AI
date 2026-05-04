export class OllamaClient {
  constructor(
    private baseUrl = "http://127.0.0.1:11434",
    public embedModel = "nomic-embed-text",
    public genModel = "llama3.2"
  ) {}

  async isAvailable() {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      return res.ok;
    } catch {
      return false;
    }
  }

  async embed(prompt: string): Promise<number[]> {
    const res = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.embedModel, prompt })
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { embedding?: number[] };
    return Array.isArray(data.embedding) ? data.embedding : [];
  }

  async generate(prompt: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.genModel, prompt, stream: false })
    });
    if (!res.ok) return "ERROR: Ollama unavailable. Run: ollama serve";
    const data = (await res.json()) as { response?: string };
    return typeof data.response === "string" ? data.response : "";
  }
}


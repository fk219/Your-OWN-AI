export type ApiError = { message: string; status?: number };

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { method: "GET", signal });
    if (!res.ok) throw { message: `Request failed: ${res.status}`, status: res.status } as ApiError;
    return (await res.json()) as T;
  }

  async postJson<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal
    });
    if (!res.ok) throw { message: `Request failed: ${res.status}`, status: res.status } as ApiError;
    return (await res.json()) as T;
  }

  async deleteJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { method: "DELETE", signal });
    if (!res.ok) throw { message: `Request failed: ${res.status}`, status: res.status } as ApiError;
    return (await res.json()) as T;
  }
}

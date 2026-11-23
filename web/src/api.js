const base = import.meta.env.VITE_API_URL || '';
const operatorToken = import.meta.env.VITE_DEMO_ADMIN_TOKEN || 'demo-operator-key';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(path, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();
  const maxAttempts = method === 'GET' ? 3 : 2;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${base}${path}`, {
        headers: {
          'content-type': 'application/json',
          'x-demo-admin-token': operatorToken,
          ...(options.headers || {})
        },
        ...options
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) return data;

      lastError = new Error(data?.error?.message || `Request failed (${response.status})`);
      const retryable = [502, 503, 504].includes(response.status);
      if (!retryable || attempt === maxAttempts) throw lastError;
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) throw error;
    }
    await wait(1200 * attempt);
  }

  throw lastError;
}

export const api = {
  health: () => request('/api/health'),
  stats: () => request('/api/stats'),
  demo: () => request('/api/demo'),
  search: (payload) => request('/api/search', { method: 'POST', body: JSON.stringify(payload) }),
  benchmark: (payload) => request('/api/benchmark', { method: 'POST', body: JSON.stringify(payload) }),
  documents: () => request('/api/documents'),
  addDocument: (payload) => request('/api/documents', { method: 'POST', body: JSON.stringify(payload) }),
  deleteDocument: (id) => request(`/api/documents/${id}`, { method: 'DELETE' }),
  ask: (payload) => request('/api/ask', { method: 'POST', body: JSON.stringify(payload) })
};

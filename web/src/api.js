const base = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `Request failed (${response.status})`);
  }
  return data;
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

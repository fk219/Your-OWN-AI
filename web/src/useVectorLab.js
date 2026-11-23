import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

export function useVectorLab() {
  const [demo, setDemo] = useState({ vectors: [], categories: [], stats: null });
  const [documents, setDocuments] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [algorithm, setAlgorithm] = useState('hnsw');
  const [metric, setMetric] = useState('cosine');
  const [k, setK] = useState(5);
  const [results, setResults] = useState(null);
  const [benchmark, setBenchmark] = useState(null);
  const [askResult, setAskResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const selected = demo.vectors.find((vector) => vector.id === selectedId) || demo.vectors[0] || null;

  const load = useCallback(async () => {
    const [demoResponse, docsResponse] = await Promise.all([api.demo(), api.documents()]);
    setDemo(demoResponse);
    setDocuments(docsResponse.items);
    return demoResponse;
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const demoResponse = await load();
      if (!demoResponse.vectors[0]) return;
      const first = demoResponse.vectors[0];
      setSelectedId(first.id);
      const search = await api.search({
        vector: first.vector,
        k: 5,
        metric: 'cosine',
        algorithm: 'hnsw'
      });
      setResults(search);
    } catch (err) {
      setError(err.message || 'The API did not answer. It may be waking up.');
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const withAction = async (name, task) => {
    setAction(name);
    setError('');
    setNotice('');
    try {
      return await task();
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setAction('');
    }
  };

  const searchVector = (vector, overrides = {}) =>
    withAction('search', async () => {
      const response = await api.search({
        vector,
        k,
        metric,
        algorithm,
        ...overrides
      });
      setResults(response);
      return response;
    });

  const selectVector = (vector) => {
    setSelectedId(vector.id);
    setBenchmark(null);
    void searchVector(vector.vector);
  };

  const runSearch = () => {
    if (!selected) return;
    setBenchmark(null);
    void searchVector(selected.vector);
  };

  const changeMetric = (nextMetric) => {
    setMetric(nextMetric);
    setBenchmark(null);
    if (selected) void searchVector(selected.vector, { metric: nextMetric });
  };

  const runBenchmark = () =>
    withAction('benchmark', async () => {
      const response = await api.benchmark({ metric, k });
      setBenchmark(response);
      return response;
    });

  const addDocument = (payload) =>
    withAction('document', async () => {
      const response = await api.addDocument(payload);
      const demoResponse = await load();
      setDemo(demoResponse);
      setNotice(`Added “${response.document.title}” and rebuilt the document index.`);
      return response.document;
    });

  const deleteDocument = (id) =>
    withAction('delete', async () => {
      await api.deleteDocument(id);
      const demoResponse = await load();
      setDemo(demoResponse);
      setNotice('Document removed and the index rebuilt.');
    });

  const ask = (question) =>
    withAction('ask', async () => {
      const response = await api.ask({ question, k: 4 });
      setAskResult(response);
      return response;
    });

  return {
    demo,
    documents,
    selected,
    selectedId,
    algorithm,
    metric,
    k,
    results,
    benchmark,
    askResult,
    loading,
    action,
    error,
    notice,
    setAlgorithm,
    setK,
    setMetric: changeMetric,
    setNotice,
    selectVector,
    runSearch,
    runBenchmark,
    addDocument,
    deleteDocument,
    ask,
    reload
  };
}

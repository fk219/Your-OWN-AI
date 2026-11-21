import { Router } from 'express';
import { engine } from './engine.js';

const wrap = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'vector-ai-api', time: new Date().toISOString() });
});

router.get('/stats', (_req, res) => {
  res.json(engine.stats());
});

router.get('/demo', (_req, res) => {
  res.json(engine.demoPayload());
});

router.post(
  '/search',
  wrap(async (req, res) => {
    res.json(engine.searchDemo(req.body || {}));
  })
);

router.post(
  '/benchmark',
  wrap(async (req, res) => {
    res.json(engine.benchmark(req.body || {}));
  })
);

router.get(
  '/documents',
  wrap(async (_req, res) => {
    res.json({ items: await engine.listDocuments() });
  })
);

router.post(
  '/documents',
  wrap(async (req, res) => {
    res.status(201).json({ document: await engine.addDocument(req.body || {}) });
  })
);

router.delete(
  '/documents/:id',
  wrap(async (req, res) => {
    const removed = await engine.deleteDocument(req.params.id);
    if (!removed) return res.status(404).json({ error: { message: 'Document not found' } });
    res.json({ ok: true });
  })
);

router.post(
  '/ask',
  wrap(async (req, res) => {
    const { question, k = 4 } = req.body || {};
    res.json(engine.ask(question, k));
  })
);

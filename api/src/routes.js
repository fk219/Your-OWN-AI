import { Router } from 'express';
import mongoose from 'mongoose';
import { engine } from './engine.js';
import { openapi } from './openapi.js';
import { expensiveLimiter, requireOperator, searchLimiter, writeLimiter } from './security.js';
import { validate } from './validate.js';
import { askSchema, benchmarkSchema, documentSchema, searchSchema } from './schemas.js';

const wrap = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

export const router = Router();

router.get('/health', (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    ok: databaseReady,
    service: 'vector-search-api',
    database: databaseReady ? 'connected' : 'disconnected',
    uptimeSeconds: Number(process.uptime().toFixed(1)),
    time: new Date().toISOString()
  });
});

router.get('/openapi.json', (_req, res) => {
  res.json(openapi);
});

router.get('/stats', (_req, res) => {
  res.json(engine.stats());
});

router.get('/demo', (_req, res) => {
  res.json(engine.demoPayload());
});

router.post(
  '/search',
  searchLimiter,
  validate(searchSchema),
  wrap(async (req, res) => {
    res.json(engine.searchDemo(req.body));
  })
);

router.post(
  '/benchmark',
  expensiveLimiter,
  validate(benchmarkSchema),
  wrap(async (req, res) => {
    res.json(engine.benchmark(req.body));
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
  requireOperator,
  writeLimiter,
  validate(documentSchema),
  wrap(async (req, res) => {
    res.status(201).json({ document: await engine.addDocument(req.body) });
  })
);

router.delete(
  '/documents/:id',
  requireOperator,
  writeLimiter,
  wrap(async (req, res) => {
    const removed = await engine.deleteDocument(req.params.id);
    if (!removed) return res.status(404).json({ error: { message: 'Document not found' } });
    res.json({ ok: true });
  })
);

router.post(
  '/ask',
  expensiveLimiter,
  validate(askSchema),
  wrap(async (req, res) => {
    const { question, k } = req.body;
    res.json(engine.ask(question, k));
  })
);

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;
let app;
let db;
let engine;
let seedData;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  db = await import('../src/db.js');
  await db.connectDb(mongod.getUri('vectorai_test'));
  ({ seedData } = await import('../src/seed.js'));
  ({ engine } = await import('../src/engine.js'));
  const { createApp } = await import('../src/app.js');
  app = createApp();
}, 60000);

beforeEach(async () => {
  await seedData({ force: true });
  await engine.rebuild();
}, 30000);

afterAll(async () => {
  await db.disconnectDb();
  await mongod.stop();
}, 30000);

describe('Vector AI API', () => {
  it('serves health with MongoDB readiness and stats', async () => {
    const health = await request(app).get('/api/health');
    expect(health.status).toBe(200);
    expect(health.body.ok).toBe(true);
    expect(health.body.database).toBe('connected');

    const stats = await request(app).get('/api/stats');
    expect(stats.body.demoVectors).toBe(20);
    expect(stats.body.documents).toBe(12);
    expect(stats.body.embeddingProvider).toBe('hash-256');
  });

  it('serves the 16D demo field', async () => {
    const demo = await request(app).get('/api/demo');
    expect(demo.status).toBe(200);
    expect(demo.body.vectors).toHaveLength(20);
    expect(demo.body.categories).toEqual(expect.arrayContaining(['cs', 'math', 'food', 'sports']));
    expect(demo.body.stats.algorithms.hnsw.nodes).toBe(20);
  });

  it('searches the demo field with all three algorithms', async () => {
    const demo = await request(app).get('/api/demo');
    const vector = demo.body.vectors.find((item) => item.category === 'cs').vector;
    for (const algorithm of ['hnsw', 'kdtree', 'brute']) {
      const response = await request(app)
        .post('/api/search')
        .send({ vector, k: 5, metric: 'cosine', algorithm });
      expect(response.status).toBe(200);
      expect(response.body.results).toHaveLength(5);
      expect(response.body.results[0].label).toBeTruthy();
    }
  });

  it('benchmarks recall and latency', async () => {
    const response = await request(app).post('/api/benchmark').send({ metric: 'cosine', k: 5 });
    expect(response.status).toBe(200);
    expect(response.body.algorithms).toHaveLength(3);
    const brute = response.body.algorithms.find((item) => item.name === 'brute');
    expect(brute.recall).toBe(1);
  });

  it('answers a question from the document library', async () => {
    const response = await request(app)
      .post('/api/ask')
      .send({ question: 'What is HNSW and why is it approximate?', k: 4 });
    expect(response.status).toBe(200);
    expect(response.body.mode).toBe('extractive');
    expect(response.body.answer.length).toBeGreaterThan(20);
    expect(response.body.sources.length).toBeGreaterThan(0);
  });

  it('gates document changes and validates the payload', async () => {
    const denied = await request(app)
      .post('/api/documents')
      .send({
        title: 'Testing the vector index',
        text: 'A deterministic test document about graphs, vectors, and retrieval quality.',
        tags: ['test', 'vectors'],
        category: 'Testing'
      });
    expect(denied.status).toBe(401);

    const invalid = await request(app)
      .post('/api/documents')
      .set('x-demo-admin-token', 'demo-operator-key')
      .send({ title: '', text: 'short' });
    expect(invalid.status).toBe(400);

    const created = await request(app)
      .post('/api/documents')
      .set('x-demo-admin-token', 'demo-operator-key')
      .send({
        title: 'Testing the vector index',
        text: 'A deterministic test document about graphs, vectors, and retrieval quality.',
        tags: ['test', 'vectors'],
        category: 'Testing'
      });
    expect(created.status).toBe(201);
    expect(created.body.document.dims).toBe(256);

    const docs = await request(app).get('/api/documents');
    expect(docs.body.items).toHaveLength(13);

    const deniedDelete = await request(app).delete(`/api/documents/${created.body.document.id}`);
    expect(deniedDelete.status).toBe(401);

    const removed = await request(app)
      .delete(`/api/documents/${created.body.document.id}`)
      .set('x-demo-admin-token', 'demo-operator-key');
    expect(removed.status).toBe(200);
    const after = await request(app).get('/api/documents');
    expect(after.body.items).toHaveLength(12);
  });

  it('rejects an invalid demo vector', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({ vector: [1, 2, 3], algorithm: 'hnsw' });
    expect(response.status).toBe(400);
  });
});

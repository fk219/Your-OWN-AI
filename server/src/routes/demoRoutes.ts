import type { Router } from "express";
import { applyCors } from "../cors.js";
import type { VectorDB } from "../db/vectorDb.js";

function parseVec(s: string) {
  return s
    .split(",")
    .map((t) => Number(t))
    .filter((x) => Number.isFinite(x));
}

export function registerDemoRoutes(router: Router, db: VectorDB) {
  router.get("/search", (req, res) => {
    applyCors(res);
    const q = parseVec(String(req.query.v ?? ""));
    if (q.length !== db.dims) {
      res.json({ error: `need ${db.dims}D vector` });
      return;
    }
    const k = Number(req.query.k ?? 5);
    const metric = String(req.query.metric ?? "cosine");
    const algo = String(req.query.algo ?? "hnsw");
    const out = db.search(q, Number.isFinite(k) ? k : 5, metric as any, algo as any);
    res.json(out);
  });

  router.post("/insert", (req, res) => {
    applyCors(res);
    const meta = String(req.body?.metadata ?? "");
    const cat = String(req.body?.category ?? "");
    const emb = Array.isArray(req.body?.embedding) ? req.body.embedding.map(Number) : [];
    if (!meta || !emb.length || emb.length !== db.dims) {
      res.json({ error: "invalid body" });
      return;
    }
    const id = db.insert(meta, cat, emb);
    res.json({ id });
  });

  router.delete("/delete/:id", (req, res) => {
    applyCors(res);
    const id = Number(req.params.id);
    const ok = Number.isFinite(id) ? db.remove(id) : false;
    res.json({ ok });
  });

  router.get("/items", (_req, res) => {
    applyCors(res);
    res.json(db.all());
  });

  router.get("/benchmark", (req, res) => {
    applyCors(res);
    const q = parseVec(String(req.query.v ?? ""));
    if (q.length !== db.dims) {
      res.json({ error: `need ${db.dims}D vector` });
      return;
    }
    const k = Number(req.query.k ?? 5);
    const metric = String(req.query.metric ?? "cosine");
    res.json(db.benchmark(q, Number.isFinite(k) ? k : 5, metric as any));
  });

  router.get("/hnsw-info", (_req, res) => {
    applyCors(res);
    res.json(db.hnswInfo());
  });
}


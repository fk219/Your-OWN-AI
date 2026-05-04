import type { Router } from "express";
import { applyCors } from "../cors.js";
import type { DocumentDB } from "../db/documentDb.js";
import type { VectorDB } from "../db/vectorDb.js";
import type { OllamaClient } from "../ollama/ollamaClient.js";

export function registerMetaRoutes(router: Router, db: VectorDB, docDb: DocumentDB, ollama: OllamaClient) {
  router.get("/status", async (_req, res) => {
    applyCors(res);
    const up = await ollama.isAvailable();
    res.json({
      ollamaAvailable: up,
      embedModel: ollama.embedModel,
      genModel: ollama.genModel,
      docCount: docDb.size(),
      docDims: docDb.getDims(),
      demoDims: db.dims,
      demoCount: db.all().length
    });
  });

  router.get("/stats", (_req, res) => {
    applyCors(res);
    res.json(db.stats());
  });
}


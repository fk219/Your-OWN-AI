import cors from "cors";
import express from "express";
import { applyCors } from "./cors.js";
import { DocumentDB } from "./db/documentDb.js";
import { VectorDB } from "./db/vectorDb.js";
import { OllamaClient } from "./ollama/ollamaClient.js";
import { registerDemoRoutes } from "./routes/demoRoutes.js";
import { registerDocRoutes } from "./routes/docRoutes.js";
import { registerMetaRoutes } from "./routes/metaRoutes.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.options(/.*/, (_req, res) => {
    applyCors(res);
    res.status(204).end();
  });

  const db = new VectorDB(16);
  db.loadDemo();
  const docDb = new DocumentDB();
  const ollama = new OllamaClient();

  registerDemoRoutes(app, db);
  registerDocRoutes(app, docDb, ollama);
  registerMetaRoutes(app, db, docDb, ollama);

  app.get("/health", (_req, res) => {
    applyCors(res);
    res.json({ ok: true });
  });

  return app;
}

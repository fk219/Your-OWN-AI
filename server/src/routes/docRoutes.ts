import type { Router } from "express";
import { applyCors } from "../cors.js";
import type { DocumentDB } from "../db/documentDb.js";
import type { OllamaClient } from "../ollama/ollamaClient.js";
import { chunkText } from "../text/chunker.js";

function countWords(text: string) {
  const ws = text.trim().split(/\s+/).filter(Boolean);
  return ws.length;
}

export function registerDocRoutes(router: Router, docDb: DocumentDB, ollama: OllamaClient) {
  router.post("/doc/insert", async (req, res) => {
    applyCors(res);
    const title = String(req.body?.title ?? "");
    const text = String(req.body?.text ?? "");
    if (!title || !text) {
      res.json({ error: "need title and text" });
      return;
    }

    const chunks = chunkText(text, 250, 30);
    const ids: number[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const emb = await ollama.embed(chunks[i]);
      if (!emb.length) {
        res.json({
          error:
            "Ollama unavailable. Install from https://ollama.com then run: ollama pull nomic-embed-text && ollama pull llama3.2"
        });
        return;
      }
      const chunkTitle = chunks.length > 1 ? `${title} [${i + 1}/${chunks.length}]` : title;
      ids.push(docDb.insert(chunkTitle, chunks[i], emb));
    }

    res.json({ ids, chunks: chunks.length, dims: docDb.getDims() });
  });

  router.delete("/doc/delete/:id", (req, res) => {
    applyCors(res);
    const id = Number(req.params.id);
    const ok = Number.isFinite(id) ? docDb.remove(id) : false;
    res.json({ ok });
  });

  router.get("/doc/list", (_req, res) => {
    applyCors(res);
    const docs = docDb.all().map((d) => {
      const preview = d.text.length > 120 ? `${d.text.slice(0, 120)}…` : d.text;
      return { id: d.id, title: d.title, preview, words: countWords(d.text) };
    });
    res.json(docs);
  });

  router.post("/doc/search", async (req, res) => {
    applyCors(res);
    const question = String(req.body?.question ?? "");
    const k = Number(req.body?.k ?? 3);
    if (!question) {
      res.json({ error: "need question" });
      return;
    }
    const qEmb = await ollama.embed(question);
    if (!qEmb.length) {
      res.json({ error: "Ollama unavailable" });
      return;
    }
    const hits = docDb.search(qEmb, Number.isFinite(k) ? k : 3);
    res.json({
      contexts: hits.map((h) => ({
        id: h.item.id,
        title: h.item.title,
        distance: Number(h.distance.toFixed(4))
      }))
    });
  });

  router.post("/doc/ask", async (req, res) => {
    applyCors(res);
    const question = String(req.body?.question ?? "");
    const k = Number(req.body?.k ?? 3);
    if (!question) {
      res.json({ error: "need question" });
      return;
    }
    const qEmb = await ollama.embed(question);
    if (!qEmb.length) {
      res.json({ error: "Ollama unavailable" });
      return;
    }
    const hits = docDb.search(qEmb, Number.isFinite(k) ? k : 3);

    const ctx = hits.map((h, i) => `[${i + 1}] ${h.item.title}:\n${h.item.text}\n\n`).join("");

    const prompt =
      "You are a helpful assistant. Answer the user's question directly. " +
      "Use the provided context if it contains relevant information. " +
      "If it doesn't, just use your own general knowledge. " +
      "IMPORTANT: Do NOT mention the 'context', 'provided text', or say things like 'the context doesn't mention'. " +
      "Just answer the question naturally.\n\n" +
      "Context:\n" +
      ctx +
      "Question: " +
      question +
      "\n\nAnswer:";

    const answer = await ollama.generate(prompt);
    res.json({
      answer,
      model: ollama.genModel,
      contexts: hits.map((h) => ({
        id: h.item.id,
        title: h.item.title,
        text: h.item.text,
        distance: Number(h.distance.toFixed(4))
      })),
      docCount: docDb.size()
    });
  });
}


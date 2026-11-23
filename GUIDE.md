# Vector Field — Guide

## What it is

Vector Field is a nearest-neighbor lab and a small retrieval-augmented answering demo. It compares HNSW, KD-tree, and brute-force search on the same vectors, then lets you ask questions against a MongoDB-backed passage library.

- **Live app:** https://vectorfield.furqankhan.dev
- **API:** https://vector-ai-api.onrender.com

## Run a search

1. Open **Lab**.
2. Click a point in the vector field, or choose a vector from the query list.
3. Pick a metric: cosine, Euclidean, or Manhattan.
4. Pick an index: HNSW, KD-tree, or brute force.
5. Choose how many neighbors you want.
6. Press **Search this vector**.

The result panel shows the nearest neighbors, distance, category, and API latency. The selected point and its results are highlighted in the field.

## Compare indexes

Press **Run benchmark**. The table reports average latency and recall against brute force for the three indexes. HNSW is approximate; KD-tree is exact for this 16D Euclidean field; brute force is the ground-truth baseline.

## Use the library

1. Open **Library**.
2. Read the indexed passages.
3. Add a title, category, tags, and passage.
4. Press **Add and index**. The document is embedded and the in-process index is rebuilt.
5. Delete a document to rebuild the index without it.

## Ask a question

1. Open **Ask**.
2. Type a question about the library.
3. Press **Ask the library**.

The answer is extractive, not generated: the API retrieves passages, ranks sentences by question-token overlap, and cites the sources it used.

## Tech

React, Vite, Express, MongoDB Atlas, HNSW, KD-tree, brute force, hash-256 lexical embeddings.

## Honest limits

- The live embedding is a deterministic lexical hash, not a semantic transformer.
- The 16D demo vectors are hand-authored for clustering.
- HNSW is approximate; recall is measured rather than assumed.
- Indexes live in one Node process and are rebuilt on add/delete.
- The free Render API can cold-start after inactivity.

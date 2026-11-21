export const DEMO_VECTORS = [
  {
    label: 'Linked List: nodes connected by pointers',
    category: 'cs',
    vector: [0.9, 0.85, 0.72, 0.68, 0.12, 0.08, 0.15, 0.1, 0.05, 0.08, 0.06, 0.09, 0.07, 0.11, 0.08, 0.06]
  },
  {
    label: 'Binary Search Tree: O(log n) search and insert',
    category: 'cs',
    vector: [0.88, 0.82, 0.78, 0.74, 0.15, 0.1, 0.08, 0.12, 0.06, 0.07, 0.08, 0.05, 0.09, 0.06, 0.07, 0.1]
  },
  {
    label: 'Dynamic Programming: memoization and overlapping subproblems',
    category: 'cs',
    vector: [0.82, 0.76, 0.88, 0.8, 0.2, 0.18, 0.12, 0.09, 0.07, 0.06, 0.08, 0.07, 0.08, 0.09, 0.06, 0.07]
  },
  {
    label: 'Graph BFS and DFS: breadth and depth first traversal',
    category: 'cs',
    vector: [0.85, 0.8, 0.75, 0.82, 0.18, 0.14, 0.1, 0.08, 0.06, 0.09, 0.07, 0.06, 0.1, 0.08, 0.09, 0.07]
  },
  {
    label: 'Hash Table: O(1) lookup with collision chaining',
    category: 'cs',
    vector: [0.87, 0.78, 0.7, 0.76, 0.13, 0.11, 0.09, 0.14, 0.08, 0.07, 0.06, 0.08, 0.07, 0.1, 0.08, 0.09]
  },
  {
    label: 'Calculus: derivatives, integrals, and limits',
    category: 'math',
    vector: [0.12, 0.15, 0.18, 0.1, 0.91, 0.86, 0.78, 0.72, 0.08, 0.06, 0.07, 0.09, 0.07, 0.08, 0.06, 0.1]
  },
  {
    label: 'Linear Algebra: matrices, eigenvalues, eigenvectors',
    category: 'math',
    vector: [0.2, 0.18, 0.15, 0.12, 0.88, 0.9, 0.82, 0.76, 0.09, 0.07, 0.08, 0.06, 0.1, 0.07, 0.08, 0.09]
  },
  {
    label: 'Probability: distributions, random variables, Bayes theorem',
    category: 'math',
    vector: [0.15, 0.12, 0.2, 0.18, 0.84, 0.8, 0.88, 0.82, 0.07, 0.08, 0.06, 0.1, 0.09, 0.06, 0.09, 0.08]
  },
  {
    label: 'Number Theory: primes, modular arithmetic, RSA',
    category: 'math',
    vector: [0.22, 0.16, 0.14, 0.2, 0.8, 0.85, 0.76, 0.9, 0.08, 0.09, 0.07, 0.06, 0.08, 0.1, 0.07, 0.06]
  },
  {
    label: 'Combinatorics: permutations, combinations, generating functions',
    category: 'math',
    vector: [0.18, 0.2, 0.16, 0.14, 0.86, 0.78, 0.84, 0.8, 0.06, 0.07, 0.09, 0.08, 0.06, 0.09, 0.1, 0.07]
  },
  {
    label: 'Neapolitan Pizza: wood-fired dough and San Marzano tomatoes',
    category: 'food',
    vector: [0.08, 0.06, 0.09, 0.07, 0.07, 0.08, 0.06, 0.09, 0.9, 0.86, 0.78, 0.72, 0.08, 0.06, 0.09, 0.07]
  },
  {
    label: 'Sushi: vinegared rice, raw fish, and nori rolls',
    category: 'food',
    vector: [0.06, 0.08, 0.07, 0.09, 0.09, 0.06, 0.08, 0.07, 0.86, 0.9, 0.82, 0.76, 0.07, 0.09, 0.06, 0.08]
  },
  {
    label: 'Ramen: noodle soup with chashu pork and soft-boiled eggs',
    category: 'food',
    vector: [0.09, 0.07, 0.06, 0.08, 0.08, 0.09, 0.07, 0.06, 0.82, 0.78, 0.9, 0.84, 0.09, 0.07, 0.08, 0.06]
  },
  {
    label: 'Tacos: corn tortillas with carnitas, salsa, and cilantro',
    category: 'food',
    vector: [0.07, 0.09, 0.08, 0.06, 0.06, 0.07, 0.09, 0.08, 0.78, 0.82, 0.86, 0.9, 0.06, 0.08, 0.07, 0.09]
  },
  {
    label: 'Croissant: laminated pastry with buttery flaky layers',
    category: 'food',
    vector: [0.06, 0.07, 0.1, 0.09, 0.1, 0.06, 0.07, 0.1, 0.85, 0.8, 0.76, 0.82, 0.09, 0.07, 0.1, 0.06]
  },
  {
    label: 'Basketball: fast-paced shooting, dribbling, slam dunks',
    category: 'sports',
    vector: [0.09, 0.07, 0.08, 0.1, 0.08, 0.09, 0.07, 0.06, 0.08, 0.07, 0.09, 0.06, 0.91, 0.85, 0.78, 0.72]
  },
  {
    label: 'Football: tackles, touchdowns, field goals, and strategy',
    category: 'sports',
    vector: [0.07, 0.09, 0.06, 0.08, 0.09, 0.07, 0.1, 0.08, 0.07, 0.09, 0.08, 0.07, 0.87, 0.89, 0.82, 0.76]
  },
  {
    label: 'Tennis: racket volleys, groundstrokes, and Wimbledon serves',
    category: 'sports',
    vector: [0.08, 0.06, 0.09, 0.07, 0.07, 0.08, 0.06, 0.09, 0.09, 0.06, 0.07, 0.08, 0.83, 0.8, 0.88, 0.82]
  },
  {
    label: 'Chess: openings, endgames, tactics, strategic board game',
    category: 'sports',
    vector: [0.25, 0.2, 0.22, 0.18, 0.22, 0.18, 0.2, 0.15, 0.06, 0.08, 0.07, 0.09, 0.8, 0.84, 0.78, 0.9]
  },
  {
    label: 'Swimming: butterfly, freestyle, backstroke, Olympic competition',
    category: 'sports',
    vector: [0.06, 0.08, 0.07, 0.09, 0.08, 0.06, 0.09, 0.07, 0.1, 0.08, 0.06, 0.07, 0.85, 0.82, 0.86, 0.8]
  }
];

export const SEED_DOCUMENTS = [
  {
    title: 'HNSW: a layered proximity graph',
    category: 'Vector search',
    tags: ['hnsw', 'ann', 'graph'],
    text:
      'HNSW builds a multi-layer proximity graph. The top layers are sparse and act like an express lane; the bottom layer contains every vector. A search starts at the top, greedily moves toward the query, then explores a bounded candidate list at layer zero. The result is approximate rather than exhaustive, so HNSW trades recall for latency.'
  },
  {
    title: 'KD-trees and the curse of dimensionality',
    category: 'Vector search',
    tags: ['kd-tree', 'dimensions', 'exact'],
    text:
      'A KD-tree recursively splits the space along one axis at a time. Range search backtracks when the query cannot be closer through the other branch. The structure is exact for Euclidean and Manhattan distance, but pruning becomes weak as dimensions rise. Sixteen dimensions are workable; 768-dimensional embeddings usually favor approximate graphs instead.'
  },
  {
    title: 'Cosine similarity for text embeddings',
    category: 'Embeddings',
    tags: ['cosine', 'normalization', 'similarity'],
    text:
      'Cosine similarity measures the angle between two vectors and ignores their magnitude. Normalizing vectors to unit length makes cosine ranking equivalent to Euclidean ranking on the same vectors. That property lets a KD-tree built for Euclidean distance answer cosine queries correctly, as long as the vectors are normalized first.'
  },
  {
    title: 'How retrieval-augmented generation works',
    category: 'RAG',
    tags: ['rag', 'retrieval', 'llm'],
    text:
      'Retrieval-augmented generation has two stages. First, a retriever finds passages whose embeddings are near the question embedding. Second, a language model receives those passages as context and writes an answer. The live demo on this site runs the retriever for real, then returns an extractive answer built from the retrieved sentences. No language model is called.'
  },
  {
    title: 'MongoDB as the document store',
    category: 'Databases',
    tags: ['mongodb', 'documents', 'persistence'],
    text:
      'MongoDB stores each document as a JSON-like record. This demo keeps the title, text, tags, category, and embedding in a collection. The vector indexes live in the Node process and are rebuilt from MongoDB when documents change. The database is the durable source of truth; the index is a derived structure.'
  },
  {
    title: 'Chunking documents for retrieval',
    category: 'RAG',
    tags: ['chunking', 'retrieval', 'context'],
    text:
      'Long documents are usually split into overlapping chunks before embedding. Smaller chunks sharpen the match but can lose context; larger chunks keep context but blur the signal. This demo keeps one passage per document so the source of every retrieved sentence stays obvious.'
  },
  {
    title: 'Evaluating retrieval quality',
    category: 'Evaluation',
    tags: ['recall', 'benchmark', 'evaluation'],
    text:
      'A retrieval benchmark needs a ground truth. Brute force provides one: it checks every vector and returns the exact nearest neighbors. Approximate indexes are then scored on recall at k, the fraction of the exact neighbors they recovered, alongside latency. Fast but wrong is not a win.'
  },
  {
    title: 'Why normalized vectors matter',
    category: 'Embeddings',
    tags: ['normalization', 'vectors', 'distance'],
    text:
      'Unnormalized vectors mix direction with magnitude. For cosine distance that is fine because the formula divides by both lengths. For Euclidean and Manhattan distance, magnitude changes the ranking. This lab keeps the original vectors for exact distance calculations and uses normalized copies only for cosine-aware tree traversal.'
  },
  {
    title: 'A lexical hash embedding, explained',
    category: 'Embeddings',
    tags: ['hash', 'embedding', 'lexical'],
    text:
      'The live document retrieval uses a deterministic 256-dimensional hash embedding. Tokens and token pairs are hashed into signed dimensions, then the vector is normalized. It captures lexical overlap, not deep semantics. That makes it honest and dependency-free: the same text always produces the same vector, and no model download or API key is required.'
  },
  {
    title: 'Brute force is a feature',
    category: 'Vector search',
    tags: ['brute-force', 'baseline', 'exact'],
    text:
      'Brute force checks every vector. It is exact, simple, and often fast enough for a few thousand records. In this lab it is the baseline for both correctness and speed. If an approximate index cannot beat brute force on a small collection, that is useful information rather than a failure.'
  },
  {
    title: 'React state for a retrieval interface',
    category: 'Frontend',
    tags: ['react', 'state', 'ui'],
    text:
      'A retrieval UI has three kinds of state: the query, the selected algorithm and metric, and the results. Keeping those separate makes every control explainable. The result list should show distance, rank, and the exact source passage, not just a confident-looking answer.'
  },
  {
    title: 'Approximate indexes in production',
    category: 'Vector search',
    tags: ['production', 'ann', 'operations'],
    text:
      'Production vector systems care about recall, latency, memory, and update cost together. HNSW is fast to query but expensive to rebuild; KD-trees are exact but struggle in high dimensions. Managed services add replication, filtering, and persistence. This demo keeps the moving parts small enough to inspect.'
  }
];

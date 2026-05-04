const KW: Record<string, string[]> = {
  cs: [
    "algorithm",
    "data",
    "tree",
    "graph",
    "array",
    "linked",
    "hash",
    "stack",
    "queue",
    "sort",
    "binary",
    "dynamic",
    "programming",
    "recursion",
    "complexity",
    "pointer",
    "node",
    "search",
    "insert",
    "bfs",
    "dfs",
    "heap",
    "trie"
  ],
  math: [
    "calculus",
    "matrix",
    "probability",
    "theorem",
    "integral",
    "derivative",
    "linear",
    "algebra",
    "equation",
    "function",
    "prime",
    "modular",
    "combinatorics",
    "permutation",
    "eigenvalue",
    "statistics",
    "proof"
  ],
  food: [
    "food",
    "pizza",
    "sushi",
    "ramen",
    "pasta",
    "recipe",
    "cook",
    "eat",
    "restaurant",
    "dish",
    "ingredient",
    "flavor",
    "spice",
    "noodle",
    "bread",
    "croissant",
    "taco",
    "fish",
    "rice",
    "soup"
  ],
  sports: [
    "sport",
    "basketball",
    "football",
    "tennis",
    "chess",
    "swim",
    "game",
    "play",
    "score",
    "team",
    "athlete",
    "competition",
    "match",
    "tournament",
    "olympic",
    "dribble",
    "tackle",
    "serve"
  ]
};

export function textToEmbedding(text: string) {
  const t = text.toLowerCase();
  const ws = t.split(/\s+/);
  const s: Record<string, number> = { cs: 0, math: 0, food: 0, sports: 0 };

  for (const w of ws) {
    for (const [cat, kws] of Object.entries(KW)) {
      for (const kw of kws) {
        if (w.includes(kw) || kw.startsWith(w)) {
          s[cat] += 0.35;
          break;
        }
      }
    }
  }

  const mx = Math.max(...Object.values(s), 0.01);
  const n = (v: number) => Math.min((v / mx) * 0.88, 0.94);
  const jitter = () => (Math.random() - 0.5) * 0.04;

  const emb = new Array(16).fill(0.08);
  const fill = (i: number, score: number) => {
    if (score < 0.01) return;
    const b = n(score);
    emb[i] = Math.max(0.05, b + jitter());
    emb[i + 1] = Math.max(0.05, b + jitter());
    emb[i + 2] = Math.max(0.05, b * 0.92 + jitter());
    emb[i + 3] = Math.max(0.05, b * 0.87 + jitter());
  };

  fill(0, s.cs);
  fill(4, s.math);
  fill(8, s.food);
  fill(12, s.sports);

  return emb;
}


type MountOptions = {
  apiBase: string;
};

export function mountLegacyUI(root: HTMLElement, opts: MountOptions) {
  root.innerHTML = `
<header>
  <h1>padhowithPratyush</h1>
  <span class="badge hl">HNSW</span>
  <span class="badge">KD-TREE</span>
  <span class="badge">BRUTE FORCE</span>
  <span class="badge" id="ollamaBadge">OLLAMA…</span>
  <span id="statsLabel">loading…</span>
</header>

<div class="layout">
  <div class="left-panel">
    <div>
      <div class="sec">Query (Demo Vectors)</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <input type="text" id="qInput" placeholder="binary tree, sushi, basketball…" />
        <button class="btn-p" onclick="runSearch()">⚡ SEARCH</button>
      </div>
    </div>
    <div>
      <div class="sec">Algorithm</div>
      <div class="algo-row">
        <div class="algo-btn on" data-algo="hnsw"      onclick="setAlgo(this)">HNSW</div>
        <div class="algo-btn"   data-algo="kdtree"     onclick="setAlgo(this)">KD-TREE</div>
        <div class="algo-btn"   data-algo="bruteforce" onclick="setAlgo(this)">BRUTE</div>
      </div>
    </div>
    <div>
      <div class="sec">Distance Metric</div>
      <select id="metric">
        <option value="cosine">Cosine Similarity</option>
        <option value="euclidean">Euclidean Distance</option>
        <option value="manhattan">Manhattan Distance</option>
      </select>
    </div>
    <div>
      <div class="sec">Top-K: <span id="kLabel">5</span></div>
      <input type="range" id="kSlider" min="1" max="10" value="5"
             oninput="document.getElementById('kLabel').textContent=this.value">
    </div>
    <div>
      <div class="sec">Category Legend</div>
      <div class="legend">
        <div class="leg-row"><div class="dot" style="background:var(--cs);box-shadow:0 0 5px var(--cs)"></div>CS / Algorithms</div>
        <div class="leg-row"><div class="dot" style="background:var(--math);box-shadow:0 0 5px var(--math)"></div>Mathematics</div>
        <div class="leg-row"><div class="dot" style="background:var(--food);box-shadow:0 0 5px var(--food)"></div>Food &amp; Cooking</div>
        <div class="leg-row"><div class="dot" style="background:var(--sports);box-shadow:0 0 5px var(--sports)"></div>Sports &amp; Games</div>
        <div class="leg-row"><div class="dot" style="background:var(--green);box-shadow:0 0 5px var(--green)"></div>Documents (RAG)</div>
      </div>
    </div>
    <div>
      <div class="sec">Insert Demo Vector</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <input type="text" id="addMeta" placeholder="Description…" />
        <select id="addCat">
          <option value="cs">CS / Algorithms</option>
          <option value="math">Mathematics</option>
          <option value="food">Food &amp; Cooking</option>
          <option value="sports">Sports &amp; Games</option>
        </select>
        <button class="btn-s" onclick="addVector()">+ INSERT</button>
      </div>
    </div>
    <div>
      <div class="sec">Benchmark</div>
      <button class="btn-s" onclick="runBenchmark()">▶ COMPARE ALL ALGOS</button>
    </div>
  </div>

  <div class="center-panel"><canvas id="scatter"></canvas></div>

  <div class="right-panel">
    <div class="tabs">
      <div class="tab on"  onclick="switchTab('search')">SEARCH</div>
      <div class="tab"     onclick="switchTab('docs')">DOCUMENTS</div>
      <div class="tab"     onclick="switchTab('rag')">ASK AI</div>
    </div>

    <div class="tab-content on" id="tab-search">
      <div>
        <div class="sec">Search Latency</div>
        <div class="lat-big" id="latBig">—</div>
        <div class="lat-sub" id="latSub">No query yet</div>
      </div>
      <div>
        <div class="sec">Top Matches</div>
        <div class="results" id="results">
          <div style="color:var(--muted);font-size:11px">Run a search to see results…</div>
        </div>
      </div>
      <div>
        <div class="sec">Query Embedding (16D)</div>
        <canvas id="vecCvs" height="76"></canvas>
      </div>
      <div id="benchSec" style="display:none">
        <div class="sec">Algorithm Comparison</div>
        <div class="bench" id="benchBars"></div>
      </div>
      <div>
        <div class="sec">HNSW Graph Layers</div>
        <div class="layers" id="layers">
          <div style="color:var(--muted);font-size:11px">Loading…</div>
        </div>
      </div>
    </div>

    <div class="tab-content" id="tab-docs">
      <div>
        <div class="sec">Ollama Status</div>
        <div class="ollama-status" id="ollamaStatus">Checking…</div>
      </div>
      <div>
        <div class="sec">Insert Document</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <input type="text" id="docTitle" placeholder="Document title / topic…" />
          <textarea id="docText" placeholder="Paste your notes, textbook excerpt, lecture content…&#10;&#10;Long text is automatically split into overlapping chunks and each chunk gets its own real embedding via Ollama's nomic-embed-text model."></textarea>
          <button class="btn-g" id="insertDocBtn" onclick="insertDocument()">⚡ EMBED &amp; INSERT</button>
          <div id="insertStatus" style="font-size:11px;color:var(--muted)"></div>
        </div>
      </div>
      <div>
        <div class="sec">Stored Documents (<span id="docCountLabel">0</span>)</div>
        <div class="doc-list" id="docList">
          <div style="color:var(--muted);font-size:11px">No documents yet. Insert some above.</div>
        </div>
      </div>
    </div>

    <div class="tab-content" id="tab-rag">
      <div>
        <div class="sec">Ask a Question</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <textarea id="ragQuestion" rows="3" placeholder="What is dynamic programming?&#10;Explain the main idea of HNSW.&#10;How does the recipe differ from…"></textarea>
          <div style="display:flex;gap:6px">
            <select id="ragK" style="width:auto;flex-shrink:0">
              <option value="2">Top 2</option>
              <option value="3" selected>Top 3</option>
              <option value="5">Top 5</option>
            </select>
            <button class="btn-g" id="askBtn" onclick="askAI()" style="flex:1">🤖 ASK AI</button>
          </div>
          <div style="font-size:10px;color:var(--muted)">Uses your inserted documents as context. Answers come from the local LLM.</div>
        </div>
      </div>
      <div>
        <div class="sec">Conversation</div>
        <div class="chat-history" id="chatHistory">
          <div style="color:var(--muted);font-size:11px">Ask a question about your inserted documents…</div>
        </div>
      </div>
    </div>

  </div>
</div>

<div id="tip"></div>
`;

  const API = opts.apiBase;
  const DIMS = 16;
  const COL: Record<string, string> = {
    cs: "#00d9ff",
    math: "#b388ff",
    food: "#ffb74d",
    sports: "#69f0ae",
    doc: "#a6e3a1",
    default: "#90a4ae"
  };

  const DIM_COL = [
    "#00d9ff","#00d9ff","#00d9ff","#00d9ff",
    "#b388ff","#b388ff","#b388ff","#b388ff",
    "#ffb74d","#ffb74d","#ffb74d","#ffb74d",
    "#69f0ae","#69f0ae","#69f0ae","#69f0ae"
  ];

  let allItems: any[] = [];
  let pcaPoints: any[] = [];
  let hitIds = new Set<number>();
  let queryPt: any = null;
  let hoverItem: any = null;
  let pulse = 0;
  let selAlgo = "hnsw";
  let searchResults: any[] = [];

  const KW: Record<string, string[]> = {
    cs: ["algorithm","data","tree","graph","array","linked","hash","stack","queue","sort","binary","dynamic","programming","recursion","complexity","pointer","node","search","insert","bfs","dfs","heap","trie"],
    math: ["calculus","matrix","probability","theorem","integral","derivative","linear","algebra","equation","function","prime","modular","combinatorics","permutation","eigenvalue","statistics","proof"],
    food: ["food","pizza","sushi","ramen","pasta","recipe","cook","eat","restaurant","dish","ingredient","flavor","spice","noodle","bread","croissant","taco","fish","rice","soup"],
    sports: ["sport","basketball","football","tennis","chess","swim","game","play","score","team","athlete","competition","match","tournament","olympic","dribble","tackle","serve"]
  };

  function textToEmbedding(text: string) {
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

  function pca2D(embs: number[][]) {
    const n = embs.length;
    const d = embs[0].length;
    if (n < 2) return embs.map(() => [0, 0]);
    const mean = new Array(d).fill(0);
    for (const e of embs) for (let i = 0; i < d; i++) mean[i] += e[i] / n;
    const X = embs.map((e) => e.map((v, i) => v - mean[i]));

    function powerIter(excl: number[] | null) {
      let v = new Array(d).fill(0).map(() => Math.random() - 0.5);
      if (excl) {
        const dot = v.reduce((s, vi, i) => s + vi * excl[i], 0);
        v = v.map((vi, i) => vi - dot * excl[i]);
      }
      let nrm = Math.sqrt(v.reduce((s, vi) => s + vi * vi, 0));
      v = v.map((vi) => vi / nrm);
      for (let it = 0; it < 200; it++) {
        const Xv = X.map((xi) => xi.reduce((s, xij, j) => s + xij * v[j], 0));
        const nv = new Array(d).fill(0);
        for (let k = 0; k < n; k++) for (let j = 0; j < d; j++) nv[j] += X[k][j] * Xv[k];
        if (excl) {
          const dot = nv.reduce((s, vi, i) => s + vi * excl[i], 0);
          for (let i = 0; i < d; i++) nv[i] -= dot * excl[i];
        }
        nrm = Math.sqrt(nv.reduce((s, vi) => s + vi * vi, 0));
        if (nrm < 1e-10) break;
        const prev = v.slice();
        v = nv.map((vi) => vi / nrm);
        if (v.reduce((s, vi, i) => s + (vi - prev[i]) ** 2, 0) < 1e-12) break;
      }
      return v;
    }

    const pc1 = powerIter(null);
    const pc2 = powerIter(pc1);
    return X.map((x) => [
      x.reduce((s, v, i) => s + v * pc1[i], 0),
      x.reduce((s, v, i) => s + v * pc2[i], 0)
    ]);
  }

  function switchTab(name: string) {
    document.querySelectorAll(".tab").forEach((t, i) => {
      const names = ["search", "docs", "rag"];
      t.classList.toggle("on", names[i] === name);
    });
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("on"));
    document.getElementById("tab-" + name)?.classList.add("on");
    if (name === "docs") loadDocList();
  }

  function setAlgo(el: HTMLElement) {
    document.querySelectorAll(".algo-btn").forEach((b) => b.classList.remove("on"));
    el.classList.add("on");
    selAlgo = String(el.getAttribute("data-algo") ?? "hnsw");
  }

  const sc = document.getElementById("scatter") as HTMLCanvasElement;
  const ctx = sc.getContext("2d")!;
  let bounds = { minX: -1, maxX: 1, minY: -1, maxY: 1 };

  function resize() {
    const r = (sc.parentElement as HTMLElement).getBoundingClientRect();
    sc.width = r.width;
    sc.height = r.height;
  }

  function w2c(wx: number, wy: number) {
    const P = 70;
    const W = sc.width;
    const H = sc.height;
    const rx = bounds.maxX - bounds.minX || 1;
    const ry = bounds.maxY - bounds.minY || 1;
    return [
      P + ((wx - bounds.minX) / rx) * (W - 2 * P),
      H - P - ((wy - bounds.minY) / ry) * (H - 2 * P)
    ];
  }

  function drawFrame() {
    ctx.clearRect(0, 0, sc.width, sc.height);
    ctx.fillStyle = "#07070f";
    ctx.fillRect(0, 0, sc.width, sc.height);
    ctx.strokeStyle = "#0e0e1e";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
      const tx = 70 + (i / 8) * (sc.width - 140);
      const ty = 70 + (i / 8) * (sc.height - 140);
      ctx.beginPath();
      ctx.moveTo(tx, 70);
      ctx.lineTo(tx, sc.height - 70);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(70, ty);
      ctx.lineTo(sc.width - 70, ty);
      ctx.stroke();
    }
    ctx.fillStyle = "#1a1a38";
    ctx.font = "11px Fira Code,monospace";
    ctx.fillText("PC₁ →", sc.width / 2 - 40, sc.height - 18);
    ctx.save();
    ctx.translate(18, sc.height / 2 + 50);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("PC₂ →", 0, 0);
    ctx.restore();
    ctx.fillStyle = "#151530";
    ctx.font = "12px Fira Code,monospace";
    ctx.fillText("2D PCA Projection  ·  Semantic Space", 80, 28);

    if (queryPt && hitIds.size > 0) {
      const [qx, qy] = w2c(queryPt.x, queryPt.y);
      for (const pt of pcaPoints) {
        if (!hitIds.has(pt.item.id)) continue;
        const [px, py] = w2c(pt.x, pt.y);
        ctx.strokeStyle = "rgba(108,99,255,0.18)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(qx, qy);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    for (const pt of pcaPoints) {
      const [cx, cy] = w2c(pt.x, pt.y);
      const col = COL[pt.item.category] || COL.default;
      const isHit = hitIds.has(pt.item.id);
      const r = isHit ? 10 : 7;
      if (isHit) {
        const pr = r + 7 + Math.sin(pulse) * 3.5;
        ctx.beginPath();
        ctx.arc(cx, cy, pr, 0, 2 * Math.PI);
        ctx.strokeStyle = col + "55";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3);
      grd.addColorStop(0, col + (isHit ? "bb" : "88"));
      grd.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, r * 3, 0, 2 * Math.PI);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fillStyle = col;
      ctx.fill();
      if (hoverItem && hoverItem.id === pt.item.id) {
        ctx.beginPath();
        ctx.arc(cx, cy, r + 5, 0, 2 * Math.PI);
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    if (queryPt) {
      const [qx, qy] = w2c(queryPt.x, queryPt.y);
      ctx.save();
      ctx.translate(qx, qy);
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = i * (Math.PI / 5) - Math.PI / 2;
        const rr = i % 2 === 0 ? 13 : 5;
        if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
        else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
      ctx.fillStyle = "#aaaacc";
      ctx.font = "10px Fira Code,monospace";
      ctx.fillText("query", qx + 16, qy + 4);
    }

    if (!pcaPoints.length) {
      ctx.fillStyle = "#1a1a38";
      ctx.font = "13px Fira Code,monospace";
      ctx.textAlign = "center";
      ctx.fillText("Connecting to VectorDB…", sc.width / 2, sc.height / 2);
      ctx.textAlign = "left";
    }

    pulse += 0.05;
    requestAnimationFrame(drawFrame);
  }

  sc.addEventListener("mousemove", (e) => {
    const rect = sc.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    hoverItem = null;
    let best = 18;
    for (const pt of pcaPoints) {
      const [cx, cy] = w2c(pt.x, pt.y);
      const d = Math.hypot(mx - cx, my - cy);
      if (d < best) {
        best = d;
        hoverItem = pt.item;
      }
    }
    const tip = document.getElementById("tip") as HTMLDivElement;
    if (hoverItem) {
      const col = COL[hoverItem.category] || COL.default;
      tip.style.display = "block";
      tip.style.left = e.clientX + 14 + "px";
      tip.style.top = e.clientY - 8 + "px";
      tip.innerHTML = `<span style="color:${col}">[${hoverItem.category}]</span><br>${hoverItem.metadata}`;
    } else tip.style.display = "none";
  });

  sc.addEventListener("mouseleave", () => {
    hoverItem = null;
    const tip = document.getElementById("tip") as HTMLDivElement;
    tip.style.display = "none";
  });

  async function loadItems() {
    try {
      const r = await fetch(API + "/items");
      allItems = await r.json();
      if (allItems.length >= 2) {
        const coords = pca2D(allItems.map((v) => v.embedding));
        pcaPoints = allItems.map((item, i) => ({ x: coords[i][0], y: coords[i][1], item }));
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        for (const p of pcaPoints) {
          x0 = Math.min(x0, p.x);
          x1 = Math.max(x1, p.x);
          y0 = Math.min(y0, p.y);
          y1 = Math.max(y1, p.y);
        }
        const px = (x1 - x0) * 0.18 || 0.1;
        const py = (y1 - y0) * 0.18 || 0.1;
        bounds = { minX: x0 - px, maxX: x1 + px, minY: y0 - py, maxY: y1 + py };
      }
      const statsLabel = document.getElementById("statsLabel") as HTMLSpanElement;
      statsLabel.textContent = allItems.length + " vectors · " + DIMS + " dims";
    } catch {}
  }

  async function runSearch() {
    const input = document.getElementById("qInput") as HTMLInputElement;
    const text = input.value.trim();
    if (!text) return;
    const emb = textToEmbedding(text);
    const k = parseInt((document.getElementById("kSlider") as HTMLInputElement).value);
    const metric = (document.getElementById("metric") as HTMLSelectElement).value;
    const url = `${API}/search?v=${emb.join(",")}&k=${k}&metric=${metric}&algo=${selAlgo}`;
    try {
      const r = await fetch(url);
      const data = await r.json();
      searchResults = data.results || [];
      hitIds = new Set(searchResults.map((r: any) => r.id));
      const us = data.latencyUs || 0;
      const latBig = document.getElementById("latBig") as HTMLDivElement;
      latBig.textContent = us < 1000 ? us + " μs" : (us / 1000).toFixed(2) + " ms";
      const latSub = document.getElementById("latSub") as HTMLDivElement;
      latSub.textContent = selAlgo.toUpperCase() + "  ·  " + metric + "  ·  k=" + k;
      if (searchResults.length > 0) {
        let sx = 0, sy = 0, sw = 0;
        for (let i = 0; i < Math.min(3, searchResults.length); i++) {
          const pt = pcaPoints.find((p) => p.item.id === searchResults[i].id);
          if (pt) {
            const w = 1 / (i + 1);
            sx += pt.x * w;
            sy += pt.y * w;
            sw += w;
          }
        }
        if (sw > 0) queryPt = { x: sx / sw + (Math.random() - 0.5) * 0.015, y: sy / sw + (Math.random() - 0.5) * 0.015 };
      }
      renderResults(searchResults);
      drawVecChart(emb);
    } catch {
      alert("Cannot reach server — is it running on :8080?");
    }
  }

  function renderResults(results: any[]) {
    const el = document.getElementById("results") as HTMLDivElement;
    if (!results || !results.length) {
      el.innerHTML = '<div style="color:var(--muted);font-size:11px">No results</div>';
      return;
    }
    el.innerHTML = results
      .map((r, i) => {
        const col = COL[r.category] || COL.default;
        return `<div class="rcard" onmouseenter="hoverItem={id:${r.id}}" onmouseleave="hoverItem=null">
      <div class="rrank">#${i + 1} NEAREST</div>
      <div class="rmeta">${r.metadata}</div>
      <div class="rfoot">
        <span class="rcat" style="background:${col}18;color:${col};border:1px solid ${col}44">${String(r.category).toUpperCase()}</span>
        <span class="rdist">dist: ${Number(r.distance).toFixed(5)}</span>
        <button class="del" onclick="deleteItem(${r.id})">✕</button>
      </div>
    </div>`;
      })
      .join("");
  }

  function drawVecChart(emb: number[]) {
    const vc = document.getElementById("vecCvs") as HTMLCanvasElement;
    const W = (vc.parentElement as HTMLElement).clientWidth;
    vc.width = W;
    const vx = vc.getContext("2d")!;
    vx.clearRect(0, 0, W, 76);
    vx.fillStyle = "#07070f";
    vx.fillRect(0, 0, W, 76);
    const bw = (W - 4) / DIMS;
    for (let i = 0; i < DIMS; i++) {
      const h = emb[i] * 58;
      const x = 2 + i * bw;
      const col = DIM_COL[i];
      vx.shadowColor = col;
      vx.shadowBlur = 5;
      vx.fillStyle = col + "aa";
      vx.fillRect(x + 1, 63 - h, bw - 2, h);
    }
    vx.shadowBlur = 0;
    vx.font = "8px monospace";
    vx.textAlign = "center";
    ([
      ["CS", 0, COL.cs],
      ["MATH", 4, COL.math],
      ["FOOD", 8, COL.food],
      ["SPORT", 12, COL.sports]
    ] as const).forEach(([lbl, gi, c]) => {
      vx.fillStyle = c + "77";
      vx.fillText(lbl, 2 + (gi + 1.5) * bw, 74);
    });
    vx.textAlign = "left";
  }

  async function runBenchmark() {
    const text = ((document.getElementById("qInput") as HTMLInputElement).value.trim()) || "binary tree algorithm";
    const emb = textToEmbedding(text);
    const metric = (document.getElementById("metric") as HTMLSelectElement).value;
    try {
      const r = await fetch(`${API}/benchmark?v=${emb.join(",")}&k=5&metric=${metric}`);
      const d = await r.json();
      (document.getElementById("benchSec") as HTMLDivElement).style.display = "block";
      const mx = Math.max(d.bruteforceUs, d.kdtreeUs, d.hnswUs, 1);
      const bars = [
        { lbl: "Brute Force", us: d.bruteforceUs, col: "#f38ba8" },
        { lbl: "KD-Tree", us: d.kdtreeUs, col: "#89dceb" },
        { lbl: "HNSW", us: d.hnswUs, col: "#b388ff" }
      ];
      (document.getElementById("benchBars") as HTMLDivElement).innerHTML = bars
        .map(({ lbl, us, col }) => {
          const pct = Math.max((us / mx) * 100, 2);
          const disp = us < 1000 ? us + " μs" : (us / 1000).toFixed(2) + " ms";
          return `<div class="brow"><div class="blabel"><span style="color:${col}">${lbl}</span><span style="color:var(--muted)">${disp}</span></div><div class="btrack"><div class="bfill" style="width:${pct}%;background:${col}"></div></div></div>`;
        })
        .join("");
    } catch {}
  }

  async function loadHNSW() {
    try {
      const r = await fetch(API + "/hnsw-info");
      const d = await r.json();
      const maxN = d.nodesPerLayer?.[0] || 1;
      const layersEl = document.getElementById("layers") as HTMLDivElement;
      layersEl.innerHTML =
        (d.nodesPerLayer || [])
          .map((cnt: number, lyr: number) => {
            const pct = Math.max((cnt / maxN) * 100, 2);
            const edg = d.edgesPerLayer?.[lyr] || 0;
            return `<div class="lrow"><div class="lnum">L${lyr}</div><div class="ltrack"><div class="lfill" style="width:${pct}%"></div></div><div class="lcount">${cnt}n · ${edg}e</div></div>`;
          })
          .join("") || '<div style="color:var(--muted);font-size:11px">Empty</div>';
    } catch {}
  }

  async function addVector() {
    const meta = (document.getElementById("addMeta") as HTMLInputElement).value.trim();
    const cat = (document.getElementById("addCat") as HTMLSelectElement).value;
    if (!meta) return;
    const emb = textToEmbedding(meta + " " + cat);
    try {
      await fetch(API + "/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: meta, category: cat, embedding: emb })
      });
      (document.getElementById("addMeta") as HTMLInputElement).value = "";
      await loadItems();
      loadHNSW();
    } catch {}
  }

  async function deleteItem(id: number) {
    try {
      await fetch(`${API}/delete/${id}`, { method: "DELETE" });
      searchResults = searchResults.filter((r) => r.id !== id);
      hitIds.delete(id);
      renderResults(searchResults);
      await loadItems();
      loadHNSW();
    } catch {}
  }

  async function checkOllamaStatus() {
    try {
      const r = await fetch(API + "/status");
      const d = await r.json();
      const badge = document.getElementById("ollamaBadge") as HTMLSpanElement;
      const box = document.getElementById("ollamaStatus") as HTMLDivElement;
      if (d.ollamaAvailable) {
        badge.className = "badge ok";
        badge.textContent = "OLLAMA ✓";
        box.className = "ollama-status ok";
        box.innerHTML =
          `<span style="color:var(--green)">● Online</span><br>` +
          `Embed: <span style="color:var(--accent)">${d.embedModel}</span><br>` +
          `Generate: <span style="color:var(--accent)">${d.genModel}</span><br>` +
          `Dims: <span style="color:var(--muted)">${d.docDims || "(first insert sets this)"}</span><br>` +
          `Documents: <span style="color:var(--text)">${d.docCount}</span>`;
      } else {
        badge.className = "badge err";
        badge.textContent = "OLLAMA ✗";
        box.className = "ollama-status err";
        box.innerHTML =
          `<span style="color:var(--red)">● Offline</span><br><br>` +
          `To enable RAG features:<br>` +
          `<span style="color:var(--muted)">1. Install from ollama.com<br>` +
          `2. ollama pull nomic-embed-text<br>` +
          `3. ollama pull llama3.2</span>`;
      }
    } catch {}
  }

  async function insertDocument() {
    const title = (document.getElementById("docTitle") as HTMLInputElement).value.trim();
    const text = (document.getElementById("docText") as HTMLTextAreaElement).value.trim();
    const btn = document.getElementById("insertDocBtn") as HTMLButtonElement;
    const status = document.getElementById("insertStatus") as HTMLDivElement;
    if (!title || !text) {
      status.textContent = "⚠ Need both a title and text.";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Embedding…";
    status.innerHTML = '<span style="color:var(--muted)">Calling Ollama nomic-embed-text…</span>';

    try {
      const r = await fetch(API + "/doc/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, text })
      });
      const d = await r.json();
      if (d.error) {
        status.innerHTML = `<span style="color:var(--red)">✗ ${d.error}</span>`;
      } else {
        status.innerHTML = `<span style="color:var(--green)">✓ Inserted ${d.chunks} chunk(s) · ${d.dims}D embeddings</span>`;
        (document.getElementById("docTitle") as HTMLInputElement).value = "";
        (document.getElementById("docText") as HTMLTextAreaElement).value = "";

        const emb16 = textToEmbedding(title + " " + text);
        fetch(API + "/insert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata: title, category: "doc", embedding: emb16 })
        }).then(() => {
          loadItems().then(loadHNSW);
        });

        loadDocList();
        checkOllamaStatus();
      }
    } catch {
      status.innerHTML = '<span style="color:var(--red)">✗ Server error</span>';
    }
    btn.disabled = false;
    btn.textContent = "⚡ EMBED & INSERT";
  }

  async function loadDocList() {
    try {
      const r = await fetch(API + "/doc/list");
      const docs = await r.json();
      (document.getElementById("docCountLabel") as HTMLSpanElement).textContent = String(docs.length);
      if (!docs.length) {
        (document.getElementById("docList") as HTMLDivElement).innerHTML =
          '<div style="color:var(--muted);font-size:11px">No documents yet.</div>';
        return;
      }
      (document.getElementById("docList") as HTMLDivElement).innerHTML = docs
        .map(
          (d: any) => `
      <div class="dcard">
        <div class="dcard-title">${d.title}</div>
        <div class="dcard-preview">${d.preview}</div>
        <div class="dcard-foot">
          <span class="dcard-words">${d.words} words</span>
          <button class="del" onclick="deleteDoc(${d.id})">✕</button>
        </div>
      </div>`
        )
        .join("");
    } catch {}
  }

  async function deleteDoc(id: number) {
    try {
      await fetch(`${API}/doc/delete/${id}`, { method: "DELETE" });
      loadDocList();
      checkOllamaStatus();
    } catch {}
  }

  async function askAI() {
    const question = (document.getElementById("ragQuestion") as HTMLTextAreaElement).value.trim();
    if (!question) return;
    const k = parseInt((document.getElementById("ragK") as HTMLSelectElement).value);
    const btn = document.getElementById("askBtn") as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = "Thinking…";

    const history = document.getElementById("chatHistory") as HTMLDivElement;
    history.innerHTML = "";

    const qDiv = document.createElement("div");
    qDiv.className = "chat-q";
    qDiv.textContent = question;
    history.appendChild(qDiv);

    const thinkDiv = document.createElement("div");
    thinkDiv.className = "thinking";
    thinkDiv.innerHTML = '<div class="spinner"></div>Retrieving context & generating answer…';
    history.appendChild(thinkDiv);
    history.scrollTop = history.scrollHeight;

    fetch(API + "/doc/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, k })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.contexts && data.contexts.length > 0) {
          hitIds = new Set();
          let sx = 0, sy = 0, sw = 0;
          data.contexts.forEach((ctx: any, i: number) => {
            const pt = pcaPoints.find((p) => p.item.category === "doc" && String(ctx.title).startsWith(p.item.metadata));
            if (pt) {
              hitIds.add(pt.item.id);
              const w = 1 / (i + 1);
              sx += pt.x * w;
              sy += pt.y * w;
              sw += w;
            }
          });
          if (sw > 0) queryPt = { x: sx / sw + (Math.random() - 0.5) * 0.015, y: sy / sw + (Math.random() - 0.5) * 0.015 };
        } else {
          hitIds = new Set();
          const emb16 = textToEmbedding(question);
          fetch(`${API}/search?v=${emb16.join(",")}&k=3&metric=cosine&algo=hnsw`)
            .then((res2) => res2.json())
            .then((data2) => {
              if (data2.results && data2.results.length > 0) {
                let sx = 0, sy = 0, sw = 0;
                for (let i = 0; i < Math.min(3, data2.results.length); i++) {
                  const pt = pcaPoints.find((p) => p.item.id === data2.results[i].id);
                  if (pt) {
                    const w = 1 / (i + 1);
                    sx += pt.x * w;
                    sy += pt.y * w;
                    sw += w;
                  }
                }
                if (sw > 0) queryPt = { x: sx / sw + (Math.random() - 0.5) * 0.015, y: sy / sw + (Math.random() - 0.5) * 0.015 };
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    try {
      const r = await fetch(API + "/doc/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, k })
      });
      const d = await r.json();
      thinkDiv.remove();

      const aDiv = document.createElement("div");
      aDiv.className = "chat-a";

      if (d.error) {
        aDiv.innerHTML = `<div class="chat-a-label">ERROR</div><div class="chat-a-text" style="color:var(--red)">${d.error}</div>`;
        history.appendChild(aDiv);
      } else {
        aDiv.innerHTML =
          `<div class="chat-a-label">🤖 ${d.model || "llm"}</div>` +
          `<div class="chat-a-text" id="typeTarget"></div>` +
          `<div class="chat-ctx">` +
          `<div class="chat-ctx-label">RETRIEVED CONTEXT (${d.contexts.length} chunks)</div>` +
          d.contexts
            .map(
              (c: any, i: number) =>
                `<span class="ctx-chip" onclick="toggleCtx(${i})">#${i + 1} ${c.title} · ${Number(c.distance).toFixed(3)}</span>` +
                `<div class="ctx-expand" id="ctx-${i}">${c.text}</div>`
            )
            .join("") +
          `</div>`;
        history.appendChild(aDiv);

        const target = aDiv.querySelector("#typeTarget") as HTMLDivElement;
        target.classList.add("typing");
        const full = String(d.answer ?? "");
        let i = 0;
        const timer = setInterval(() => {
          if (i >= full.length) {
            clearInterval(timer);
            target.classList.remove("typing");
            return;
          }
          const chunk = full.slice(i, i + 3);
          target.textContent += chunk;
          i += 3;
          history.scrollTop = history.scrollHeight;
        }, 18);
      }
    } catch {
      thinkDiv.remove();
      const err = document.createElement("div");
      err.className = "chat-a";
      err.innerHTML =
        '<div class="chat-a-label">ERROR</div><div class="chat-a-text" style="color:var(--red)">Server error — is the backend running?</div>';
      history.appendChild(err);
    }

    (document.getElementById("ragQuestion") as HTMLTextAreaElement).value = "";
    btn.disabled = false;
    btn.textContent = "🤖 ASK AI";
    history.scrollTop = history.scrollHeight;
  }

  function toggleCtx(i: number) {
    const el = document.getElementById("ctx-" + i) as HTMLDivElement;
    el.style.display = el.style.display === "block" ? "none" : "block";
  }

  (globalThis as any).switchTab = switchTab;
  (globalThis as any).setAlgo = setAlgo;
  (globalThis as any).runSearch = runSearch;
  (globalThis as any).runBenchmark = runBenchmark;
  (globalThis as any).addVector = addVector;
  (globalThis as any).deleteItem = deleteItem;
  (globalThis as any).insertDocument = insertDocument;
  (globalThis as any).loadDocList = loadDocList;
  (globalThis as any).deleteDoc = deleteDoc;
  (globalThis as any).askAI = askAI;
  (globalThis as any).toggleCtx = toggleCtx;
  (globalThis as any).hoverItem = hoverItem;

  window.addEventListener("resize", resize);
  resize();
  drawFrame();

  const qInput = document.getElementById("qInput") as HTMLInputElement;
  qInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });

  const ragQuestion = document.getElementById("ragQuestion") as HTMLTextAreaElement;
  ragQuestion.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e as any).ctrlKey) askAI();
  });

  loadItems().then(loadHNSW);
  checkOllamaStatus();

  return () => {
    window.removeEventListener("resize", resize);
    root.innerHTML = "";
  };
}


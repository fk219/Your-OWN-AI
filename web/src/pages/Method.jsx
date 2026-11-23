import { Link } from 'react-router-dom';
import { ArrowRight, Binary, Boxes, Braces, Database, Layers3, Network, ScanSearch } from 'lucide-react';

const endpoints = [
  ['GET', '/api/health', 'Service heartbeat'],
  ['GET', '/api/demo', '16D vectors and 2D projection'],
  ['POST', '/api/search', 'Query HNSW, KD-tree, or brute force'],
  ['POST', '/api/benchmark', 'Latency and recall comparison'],
  ['GET', '/api/documents', 'Document library'],
  ['POST', '/api/documents', 'Embed and index a passage'],
  ['POST', '/api/ask', 'Retrieve and build an extractive answer']
];

export function Method({ data }) {
  const stats = data.demo.stats;
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">GUIDE / WHAT IT DOES + HOW TO USE IT</p>
          <h1>
            Search a field.
            <br />
            <em>Ask the library.</em>
          </h1>
          <p className="lede">
            Vector Field is a live nearest-neighbor lab. It compares HNSW, KD-tree, and brute force on
            the same vectors, then lets you ask questions against a MongoDB-backed passage library.
            Every number you see comes from the running API.
          </p>
        </div>
        <Link to="/" className="back-link">Open the lab <ArrowRight size={13} /></Link>
      </header>

      <section className="quick-guide">
        <div className="quick-guide-head">
          <p className="eyebrow">START HERE / FOUR MOVES</p>
          <h2>How to use Vector Field.</h2>
          <p>
            Start with the demo field. No key, no model download, no setup. The embedding is a local
            lexical hash, and the index is rebuilt from MongoDB on every add or delete.
          </p>
        </div>
        <div className="quick-guide-grid">
          <article>
            <span>01</span>
            <h3>Pick a point</h3>
            <p>Click any point in the field or choose a vector from the query list.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Choose the rules</h3>
            <p>Pick a distance metric, an index, and the number of neighbors you want back.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Read the result</h3>
            <p>Compare distance, category, and latency. Run the benchmark to see recall against brute force.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Ask the library</h3>
            <p>Add a passage, then ask a question. The answer is extractive and cites the retrieved sources.</p>
          </article>
        </div>
        <div className="quick-guide-actions">
          <Link to="/" className="btn primary">Run a search <ArrowRight size={14} /></Link>
          <Link to="/library" className="btn secondary">Open the library</Link>
          <Link to="/ask" className="btn secondary">Ask a question</Link>
        </div>
      </section>

      <div className="method-algorithms">
        <article className="method-card">
          <Network size={19} />
          <p className="eyebrow">01 / GRAPH</p>
          <h2>HNSW</h2>
          <p>Hierarchical Navigable Small World. Each vector is inserted into a layered proximity graph; search descends from a sparse top layer and explores a bounded list at layer zero.</p>
          <span>{stats?.algorithms?.hnsw?.nodes || 0} nodes · {stats?.algorithms?.hnsw?.levels || 0} levels · M={stats?.algorithms?.hnsw?.M || 8}</span>
        </article>
        <article className="method-card">
          <Layers3 size={19} />
          <p className="eyebrow">02 / TREE</p>
          <h2>KD-tree</h2>
          <p>Recursive axis-aligned splits with backtracking. Exact for Euclidean and Manhattan; for cosine the tree walks normalized vectors, where Euclidean ranking is equivalent.</p>
          <span>{stats?.algorithms?.kdtree?.nodes || 0} nodes · {stats?.algorithms?.kdtree?.dims || 16} dims</span>
        </article>
        <article className="method-card">
          <ScanSearch size={19} />
          <p className="eyebrow">03 / BASELINE</p>
          <h2>Brute force</h2>
          <p>Every vector, every query. It is exact and easy to audit, which makes it the right ground truth for recall. On small collections it is often fast enough.</p>
          <span>{stats?.algorithms?.brute?.nodes || 0} vectors · exact</span>
        </article>
      </div>

      <div className="method-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">THE PIPELINE</p>
              <h2>From text to a cited answer.</h2>
            </div>
            <Braces size={19} className="panel-icon" />
          </div>
          <ol className="pipeline-list">
            <li><b>Embed.</b> Tokenize the passage and hash unigrams and bigrams into 256 signed dimensions. Normalize to unit length.</li>
            <li><b>Store.</b> Mongo keeps the title, text, tags, and embedding. The vector index is derived, not the source of truth.</li>
            <li><b>Index.</b> Rebuild the document HNSW graph after every add or delete. The demo library is small enough to rebuild eagerly.</li>
            <li><b>Retrieve.</b> Embed the question, search the document graph, and return scored sources.</li>
            <li><b>Answer.</b> Rank the retrieved sentences by question-token overlap and join the top three. No generation model is called.</li>
          </ol>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">HONEST LIMITS</p>
              <h2>What this demo does not claim.</h2>
            </div>
            <Binary size={19} className="panel-icon" />
          </div>
          <ul className="limits-list">
            <li>The live embedding is lexical hash-256, not a semantic transformer. It matches shared terms and bigrams.</li>
            <li>The 16D demo vectors are hand-authored for clustering; they are not learned embeddings.</li>
            <li>HNSW is approximate. Recall is measured against brute force, not assumed.</li>
            <li>Indexes live in one Node process. Production needs persistence, replication, and filtered search.</li>
            <li>There is no authentication; this is a public lab, not a multi-tenant service.</li>
          </ul>
        </section>
      </div>

      <section className="panel api-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">API SURFACE</p>
            <h2>Seven routes, all inspectable.</h2>
          </div>
          <span className="mono tiny muted">Express · MongoDB</span>
        </div>
        <div className="endpoint-list">
          {endpoints.map(([method, path, note]) => (
            <div key={path} className="endpoint-row">
              <span className={`method method-${method.toLowerCase()}`}>{method}</span>
              <code>{path}</code>
              <span>{note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="method-cta">
        <div>
          <p className="eyebrow">THE DATA IS REAL</p>
          <h2>{stats?.demoVectors || 0} demo vectors. {stats?.documents || data.documents.length} indexed documents.</h2>
          <p>Every search below hits the live Express API and the MongoDB-backed engine.</p>
        </div>
        <div className="method-cta-actions">
          <Link to="/" className="btn primary">Run a search <ArrowRight size={14} /></Link>
          <Link to="/ask" className="btn secondary">Ask the library</Link>
        </div>
      </section>

      <div className="database-note">
        <Database size={15} />
        <span>Documents are persisted in MongoDB; HNSW and KD-tree indexes are rebuilt from that collection at startup.</span>
        <Boxes size={15} />
      </div>
    </div>
  );
}



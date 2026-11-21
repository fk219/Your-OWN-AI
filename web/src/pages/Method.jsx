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
          <p className="eyebrow">METHOD / THE INDEX, IN THE OPEN</p>
          <h1>
            Three ways
            <br />
            <em>to find a neighbor.</em>
          </h1>
          <p className="lede">
            The live demo runs three search structures side by side: a layered graph, a spatial tree,
            and an exhaustive scan. Brute force is the ground truth. Recall and latency come from the
            same API call.
          </p>
        </div>
        <Link to="/" className="back-link">Open the lab <ArrowRight size={13} /></Link>
      </header>

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



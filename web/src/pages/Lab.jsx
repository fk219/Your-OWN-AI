import { ArrowRight, BarChart3, CircleDot, Gauge, Layers3, Network, ScanSearch } from 'lucide-react';
import { VectorField } from '../components/VectorField.jsx';

const categoryColor = {
  cs: 'var(--blue)',
  math: 'var(--violet)',
  food: 'var(--coral)',
  sports: 'var(--lime)'
};

const formatMs = (value) => `${Number(value || 0).toFixed(2)} ms`;
const percent = (value) => `${Math.round(Number(value || 0) * 100)}%`;

const algorithmCopy = {
  hnsw: 'A layered proximity graph. Fast queries, approximate recall, more memory.',
  kdtree: 'Axis-aligned splits with backtracking. Exact for Euclidean and Manhattan.',
  brute: 'Checks every vector. Exact, simple, and the benchmark baseline.'
};

export function Lab({ data }) {
  const resultIds = data.results?.results?.map((result) => result.id) || [];
  const stats = data.demo.stats;
  const benchmark = data.benchmark;
  const maxBenchmark = Math.max(1, ...(benchmark?.algorithms || []).map((item) => item.avgMs));

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">VECTOR LAB / 16-DIMENSIONAL FIELD</p>
          <h1>
            Nearest is
            <br />
            <em>a direction.</em>
          </h1>
          <p className="lede">
            Twenty semantic vectors projected into two dimensions. Click a point, then ask all three
            indexes for its nearest neighbors. The distances are real; only the drawing is flat.
          </p>
          <div className="hero-meta">
            <span><CircleDot size={11} /> {stats?.demoVectors || 0} demo vectors</span>
            <span><Layers3 size={11} /> {stats?.demoDims || 16} dimensions</span>
            <span><ScanSearch size={11} /> 3 algorithms</span>
            <span><Network size={11} /> {data.documents.length} documents</span>
          </div>
        </div>
        <div className="hero-field">
          <VectorField
            vectors={data.demo.vectors}
            selectedId={data.selectedId}
            resultIds={resultIds}
            onSelect={data.selectVector}
          />
        </div>
      </section>

      <div className="lab-grid">
        <section className="panel control-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">01 / QUERY</p>
              <h2>Choose a point.</h2>
            </div>
            <Gauge size={19} className="panel-icon" />
          </div>

          <label className="field-label">
            <span>Query vector</span>
            <select
              value={data.selectedId}
              onChange={(event) => {
                const vector = data.demo.vectors.find((item) => item.id === event.target.value);
                if (vector) data.selectVector(vector);
              }}
            >
              {data.demo.categories.map((category) => (
                <optgroup key={category} label={category.toUpperCase()}>
                  {data.demo.vectors.filter((vector) => vector.category === category).map((vector) => (
                    <option key={vector.id} value={vector.id}>{vector.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          {data.selected && (
            <div className="query-vector">
              <div className="query-vector-head">
                <span className="category-pill" style={{ '--cat': categoryColor[data.selected.category] }}>
                  {data.selected.category}
                </span>
                <span className="mono tiny muted">16 numbers · {data.selected.id.slice(-6)}</span>
              </div>
              <p>{data.selected.label}</p>
              <div className="vector-chips">
                {data.selected.vector.map((value, index) => (
                  <span key={index}>{value.toFixed(2)}</span>
                ))}
              </div>
            </div>
          )}

          <div className="control-row">
            <div>
              <p className="field-label static">Metric</p>
              <div className="segmented">
                {['cosine', 'euclidean', 'manhattan'].map((metric) => (
                  <button
                    key={metric}
                    type="button"
                    className={data.metric === metric ? 'is-active' : ''}
                    onClick={() => data.setMetric(metric)}
                  >
                    {metric}
                  </button>
                ))}
              </div>
            </div>
            <label className="field-label">
              <span>Algorithm</span>
              <select value={data.algorithm} onChange={(event) => data.setAlgorithm(event.target.value)}>
                <option value="hnsw">HNSW</option>
                <option value="kdtree">KD-tree</option>
                <option value="brute">Brute force</option>
              </select>
            </label>
          </div>

          <label className="range-field">
            <span>Neighbors <b>{data.k}</b></span>
            <input
              type="range"
              min="1"
              max="10"
              value={data.k}
              onChange={(event) => data.setK(Number(event.target.value))}
            />
          </label>

          <button type="button" className="btn primary wide" onClick={data.runSearch} disabled={Boolean(data.action)}>
            {data.action === 'search' ? 'Searching…' : 'Search this vector'}
            <ArrowRight size={14} />
          </button>
        </section>

        <section className="panel results-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">02 / RESULT</p>
              <h2>Nearest neighbors.</h2>
            </div>
            {data.results && <span className="mono tiny muted">{formatMs(data.results.latencyMs)}</span>}
          </div>

          {data.results ? (
            <>
              <div className="result-summary">
                <span className="algo-chip">{data.results.algorithmLabel}</span>
                <span>{data.results.metric}</span>
                <span>k = {data.results.k}</span>
                <span className="mono tiny muted">{formatMs(data.results.latencyMs)}</span>
              </div>
              <div className="neighbor-list">
                {data.results.results.map((result) => (
                  <div key={result.id} className="neighbor-row">
                    <span className="neighbor-rank">{String(result.rank).padStart(2, '0')}</span>
                    <span className="neighbor-dot" style={{ background: categoryColor[result.category] }} />
                    <div className="neighbor-copy">
                      <p>{result.label}</p>
                      <span>{result.category}</span>
                    </div>
                    <div className="neighbor-score">
                      <strong>{result.distance.toFixed(3)}</strong>
                      <span>distance</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <ScanSearch size={22} />
              <p>Pick a point and run a search.</p>
            </div>
          )}
        </section>
      </div>

      <section className="panel benchmark-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">03 / BENCHMARK</p>
            <h2>Compare the three indexes.</h2>
          </div>
          <div className="benchmark-actions">
            <span className="mono tiny muted">recall vs brute force · {benchmark?.queries || 20} queries</span>
            <button type="button" className="btn secondary small" onClick={data.runBenchmark} disabled={Boolean(data.action)}>
              <BarChart3 size={13} />
              {data.action === 'benchmark' ? 'Running…' : 'Run benchmark'}
            </button>
          </div>
        </div>

        {benchmark ? (
          <div className="benchmark-table">
            <div className="benchmark-head">
              <span>Algorithm</span><span>Average</span><span>Recall@{benchmark.k}</span><span>Relative speed</span>
            </div>
            {benchmark.algorithms.map((item) => (
              <div key={item.name} className="benchmark-row">
                <span className="benchmark-name">{item.label}</span>
                <span className="mono">{formatMs(item.avgMs)}</span>
                <span className="mono">{percent(item.recall)}</span>
                <div className="benchmark-bar">
                  <span style={{ width: `${Math.max(4, (item.avgMs / maxBenchmark) * 100)}%` }} className={item.name} />
                </div>
              </div>
            ))}
            <p className="benchmark-note">
              Recall is the fraction of the exact top-k recovered. KD-tree is exact for this 16D field;
              HNSW is approximate and may miss a neighbor.
            </p>
          </div>
        ) : (
          <div className="empty-state small-state">
            <BarChart3 size={20} />
            <p>Run the benchmark to compare latency and recall on every demo vector.</p>
          </div>
        )}
      </section>

      <div className="algorithm-grid">
        {['hnsw', 'kdtree', 'brute'].map((name) => {
          const indexStats = stats?.algorithms?.[name];
          return (
            <article key={name} className="algorithm-card">
              <div className={`algorithm-icon algo-${name}`}>
                {name === 'hnsw' ? <Network size={18} /> : name === 'kdtree' ? <Layers3 size={18} /> : <ScanSearch size={18} />}
              </div>
              <h3>{name === 'hnsw' ? 'HNSW' : name === 'kdtree' ? 'KD-tree' : 'Brute force'}</h3>
              <p>{algorithmCopy[name]}</p>
              <div className="algorithm-stats">
                {name === 'hnsw' && <><span>{indexStats?.nodes || 0} nodes</span><span>{indexStats?.levels || 0} levels</span></>}
                {name === 'kdtree' && <><span>{indexStats?.nodes || 0} nodes</span><span>{indexStats?.dims || 16} dims</span></>}
                {name === 'brute' && <><span>{indexStats?.nodes || 0} vectors</span><span>exact</span></>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

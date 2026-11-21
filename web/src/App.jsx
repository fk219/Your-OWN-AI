import { NavLink, Route, Routes } from 'react-router-dom';
import { Activity, Boxes, CircleDot } from 'lucide-react';
import { useVectorLab } from './useVectorLab.js';
import { Lab } from './pages/Lab.jsx';
import { Library } from './pages/Library.jsx';
import { Ask } from './pages/Ask.jsx';
import { Method } from './pages/Method.jsx';

function Mark() {
  return (
    <svg viewBox="0 0 42 42" className="mark" aria-hidden="true">
      <circle cx="8" cy="31" r="2.2" fill="currentColor" />
      <circle cx="21" cy="10" r="2.2" fill="currentColor" />
      <circle cx="34" cy="25" r="2.2" fill="currentColor" />
      <circle cx="28" cy="36" r="2.2" fill="currentColor" />
      <path d="M8 31 21 10l13 15-6 11" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function Shell({ children, data }) {
  return (
    <div className="site-shell">
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="Vector Field home">
          <Mark />
          <div>
            <p className="brand-name">VECTOR / FIELD</p>
            <p className="brand-sub">nearest neighbor lab</p>
          </div>
        </NavLink>

        <nav className="nav" aria-label="Primary">
          <NavLink to="/" end>Lab</NavLink>
          <NavLink to="/library">Library</NavLink>
          <NavLink to="/ask">Ask</NavLink>
          <NavLink to="/method">Method</NavLink>
        </nav>

        <div className="topbar-status">
          <span className={`status-pill ${data.error ? 'bad' : 'good'}`}>
            <Activity size={11} />
            {data.error ? 'API offline' : 'API live'}
          </span>
          <span className="topbar-meta">
            <CircleDot size={10} /> {data.demo.stats?.demoVectors || 0} vectors
            <Boxes size={10} /> {data.documents.length} docs
          </span>
        </div>
      </header>

      <main className="main">
        {data.error && <div className="banner bad"><strong>API error.</strong> {data.error}</div>}
        {data.notice && <div className="banner good">{data.notice}</div>}
        {children}
      </main>

      <footer className="footer">
        <span>HNSW · KD-tree · brute force · hash-256 embeddings</span>
        <span>React · Express · MongoDB</span>
      </footer>
    </div>
  );
}

export default function App() {
  const data = useVectorLab();
  return (
    <Shell data={data}>
      <Routes>
        <Route path="/" element={<Lab data={data} />} />
        <Route path="/library" element={<Library data={data} />} />
        <Route path="/ask" element={<Ask data={data} />} />
        <Route path="/method" element={<Method data={data} />} />
      </Routes>
    </Shell>
  );
}

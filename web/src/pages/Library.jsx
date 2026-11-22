import { useState } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

const emptyForm = { title: '', category: 'General', tags: '', text: '' };

export function Library({ data }) {
  const [form, setForm] = useState(emptyForm);
  const busy = Boolean(data.action);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const created = await data.addDocument(form);
    if (created) setForm(emptyForm);
  };

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">LIBRARY / DOCUMENTS IN MONGO</p>
          <h1>
            The library,
            <br />
            <em>in vectors.</em>
          </h1>
          <p className="lede">
            Every document is stored in MongoDB with a 256-dimensional hash embedding. Add a passage,
            and the in-process document index is rebuilt before the next question.
          </p>
        </div>
        <div className="page-head-meta">
          <span className="big-number">{data.loading ? '—' : data.documents.length}</span>
          <span>{data.loading ? 'loading' : 'documents'}</span>
          <span className="mono tiny muted">256D · hash-256</span>
        </div>
      </header>

      <div className="library-grid">
        <section className="panel library-list-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">THE SHELF</p>
              <h2>Passages in the index.</h2>
            </div>
            <BookOpen size={19} className="panel-icon" />
          </div>

          <div className="document-list">
            {data.loading ? (
              <div className="empty-state">
                <BookOpen size={22} />
                <p>Waking the library and rebuilding the index…</p>
              </div>
            ) : data.documents.map((doc) => (
              <article key={doc.id} className="document-row">
                <div className="document-head">
                  <div>
                    <span className="category-pill">{doc.category}</span>
                    <h3>{doc.title}</h3>
                  </div>
                  <button
                    type="button"
                    className="icon-button danger"
                    aria-label={`Delete ${doc.title}`}
                    onClick={() => {
                      if (window.confirm(`Delete “${doc.title}”?`)) void data.deleteDocument(doc.id);
                    }}
                    disabled={busy}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="document-text">{doc.text}</p>
                <div className="document-foot">
                  <div className="tag-row">
                    {doc.tags.map((tag) => <span key={tag}>#{tag}</span>)}
                  </div>
                  <span className="mono tiny muted">{doc.dims}D · {doc.provider}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel add-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">ADD A PASSAGE</p>
              <h2>Grow the shelf.</h2>
            </div>
            <Plus size={19} className="panel-icon" />
          </div>

          <form className="document-form" onSubmit={submit}>
            <label>
              <span>Title</span>
              <input value={form.title} onChange={update('title')} placeholder="A short, specific title" required />
            </label>
            <label>
              <span>Category</span>
              <input value={form.category} onChange={update('category')} placeholder="Vector search" />
            </label>
            <label>
              <span>Tags</span>
              <input value={form.tags} onChange={update('tags')} placeholder="hnsw, recall, graphs" />
            </label>
            <label>
              <span>Passage</span>
              <textarea
                value={form.text}
                onChange={update('text')}
                rows={7}
                placeholder="At least 20 characters. The text is embedded, stored, and indexed."
                required
              />
            </label>
            <button type="submit" className="btn primary wide" disabled={busy}>
              <Plus size={14} />
              {data.action === 'document' ? 'Embedding…' : 'Add and index'}
            </button>
          </form>

          <p className="panel-note">
            This live demo uses a deterministic lexical hash embedding, not a semantic model.
            It captures shared terms and bigrams, and it requires no API key or model download.
          </p>
        </section>
      </div>
    </div>
  );
}

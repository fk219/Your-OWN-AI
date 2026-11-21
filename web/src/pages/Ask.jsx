import { useState } from 'react';
import { ArrowRight, MessageSquareText, Quote, Timer } from 'lucide-react';

const EXAMPLES = [
  'What is HNSW and why is it approximate?',
  'How does retrieval-augmented generation work?',
  'Why normalize vectors for cosine similarity?',
  'What does the hash embedding miss?'
];

export function Ask({ data }) {
  const [question, setQuestion] = useState(EXAMPLES[0]);
  const busy = Boolean(data.action);
  const result = data.askResult;

  const ask = (event) => {
    event.preventDefault();
    if (question.trim()) void data.ask(question);
  };

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">ASK / EXTRACTIVE RETRIEVAL</p>
          <h1>
            Ask the shelf.
            <br />
            <em>Get the passages.</em>
          </h1>
          <p className="lede">
            The question is embedded, matched against the document index, and answered with the
            retrieved sentences. Retrieval is real. The answer is extractive; no language model is called.
          </p>
        </div>
        <div className="mode-badge"><Quote size={13} /> extractive mode</div>
      </header>

      <section className="ask-panel panel">
        <form className="ask-form" onSubmit={ask}>
          <label>
            <span>Your question</span>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={3}
              placeholder="Ask about vector search, HNSW, embeddings, or the document library."
            />
          </label>
          <button type="submit" className="btn primary" disabled={busy || question.trim().length < 3}>
            {data.action === 'ask' ? 'Retrieving…' : 'Ask the library'}
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="example-row">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setQuestion(example);
                void data.ask(example);
              }}
              disabled={busy}
            >
              {example}
            </button>
          ))}
        </div>
      </section>

      {result ? (
        <div className="answer-grid">
          <section className="panel answer-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">ANSWER</p>
                <h2>From the retrieved passages.</h2>
              </div>
              <quote className="mode-chip"><Quote size={11} /> extractive</quote>
            </div>
            <p className="answer-text">{result.answer}</p>
            <div className="answer-meta">
              <span><Timer size={12} /> retrieval {result.timings.retrievalMs.toFixed(2)} ms</span>
              <span>total {result.timings.totalMs.toFixed(2)} ms</span>
              <span>{result.embedding.dims}D · {result.embedding.provider}</span>
            </div>
            <p className="answer-note">
              The answer is built by ranking sentences from the sources below. It is not generated
              prose, and it does not invent facts outside the library.
            </p>
          </section>

          <section className="panel sources-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">SOURCES</p>
                <h2>What was retrieved.</h2>
              </div>
              <MessageSquareText size={19} className="panel-icon" />
            </div>
            <div className="source-list">
              {result.sources.map((source, index) => (
                <article key={source.id} className="source-row">
                  <span className="source-rank">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="source-head">
                      <h3>{source.title}</h3>
                      <span className="mono tiny">{source.score.toFixed(3)} score</span>
                    </div>
                    <p>{source.text.slice(0, 230)}{source.text.length > 230 ? '…' : ''}</p>
                    <span className="mono tiny muted">{source.category} · distance {source.distance.toFixed(3)}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <section className="panel empty-ask">
          <MessageSquareText size={26} />
          <p>Ask a question, or choose one of the examples above. The answer will cite the passages it used.</p>
        </section>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPoems } from '../api/archive';
import StatusBlock from '../components/StatusBlock.jsx';

export default function Poems() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('loading');
  const [poems, setPoems] = useState([]);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    const timer = setTimeout(() => {
      getPoems(query ? { q: query } : {})
        .then((data) => { if (alive) { setPoems(data); setStatus('ready'); } })
        .catch(() => { if (alive) setStatus('error'); });
    }, 300);
    return () => { alive = false; clearTimeout(timer); };
  }, [query]);

  return (
    <section className="section poems-page">
      <div className="container">
        <span className="eyebrow">Poems</span>
        <h1 className="headline">시</h1>
        <input
          type="search"
          className="search-input"
          placeholder="시 제목이나 본문으로 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <hr className="rule" />

        {status === 'loading' && <StatusBlock variant="loading" />}
        {status === 'error' && <StatusBlock variant="error" />}
        {status === 'ready' && poems.length === 0 && <StatusBlock variant="empty" message="검색 결과가 없습니다." />}
        {status === 'ready' && poems.length > 0 && (
          <ul className="poems-list">
            {poems.map((poem) => (
              <li key={poem.id}>
                <Link to={`/poems/${poem.id}`} className="poems-list__row">
                  <span className="poems-list__title">{poem.title}</span>
                  <span className="footnote">{poem.collection?.title || '—'}</span>
                  <span className="footnote">{poem.year || ''}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

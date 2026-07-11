import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getArchiveItems, getSummary } from '../api/archive';
import ArchiveCard from '../components/ArchiveCard.jsx';
import StatusBlock from '../components/StatusBlock.jsx';

const TABS = [
  { value: '', label: '전체' },
  { value: 'MANUSCRIPT', label: '육필' },
  { value: 'ARTIFACT', label: '유품' },
  { value: 'DOCUMENT', label: '문헌' },
  { value: 'PHOTO', label: '사진' },
];

export default function Archive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || '';
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState('loading');
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    getSummary().then((s) => setCounts(s.items)).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    const timer = setTimeout(() => {
      const params = {};
      if (type) params.type = type;
      if (query) params.q = query;
      getArchiveItems(params)
        .then((data) => { if (alive) { setItems(data); setStatus('ready'); } })
        .catch(() => { if (alive) setStatus('error'); });
    }, 300);
    return () => { alive = false; clearTimeout(timer); };
  }, [type, query]);

  const setType = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('type', value); else next.delete('type');
    setSearchParams(next);
  };

  const totalCount = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : null;

  return (
    <section className="section archive-page">
      <div className="container">
        <span className="eyebrow">Archive</span>
        <h1 className="headline">아카이브</h1>

        <div className="archive-page__tabs">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              className={`archive-tab ${type === tab.value ? 'is-active' : ''}`}
              onClick={() => setType(tab.value)}
            >
              {tab.label}
              <span className="footnote">
                {tab.value ? (counts?.[tab.value] ?? 0) : (totalCount ?? '')}
              </span>
            </button>
          ))}
        </div>

        <input
          type="search"
          className="search-input"
          placeholder="자료 제목이나 설명으로 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <hr className="rule" />

        {status === 'loading' && <StatusBlock variant="loading" />}
        {status === 'error' && <StatusBlock variant="error" />}
        {status === 'ready' && items.length === 0 && <StatusBlock variant="empty" />}
        {status === 'ready' && items.length > 0 && (
          <div className="archive-grid">
            {items.map((item) => (
              <ArchiveCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { getSummary, getArchiveItems } from '../../api/archive';
import StatusBlock from '../../components/StatusBlock.jsx';
import PlaceholderImage from '../../components/PlaceholderImage.jsx';

const TYPE_LABEL = { MANUSCRIPT: '육필', ARTIFACT: '유품', DOCUMENT: '문헌', PHOTO: '사진' };

export default function Dashboard() {
  const [status, setStatus] = useState('loading');
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [s, items] = await Promise.all([getSummary(), getArchiveItems()]);
        setSummary(s);
        setRecent([...items].sort((a, b) => b.id - a.id).slice(0, 6));
        setStatus('ready');
      } catch {
        setStatus('error');
      }
    })();
  }, []);

  if (status === 'loading') return <StatusBlock variant="loading" />;
  if (status === 'error') return <StatusBlock variant="error" />;

  return (
    <div className="manage-page">
      <div className="manage-page__header">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1 className="section-title">대시보드</h1>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-card">
          <span className="mono-count">{summary.poems}</span>
          <span className="eyebrow">시</span>
        </div>
        <div className="dash-card">
          <span className="mono-count">{summary.collections}</span>
          <span className="eyebrow">시집</span>
        </div>
        {Object.entries(summary.items || {}).map(([type, count]) => (
          <div className="dash-card" key={type}>
            <span className="mono-count">{count}</span>
            <span className="eyebrow">{TYPE_LABEL[type] || type}</span>
          </div>
        ))}
      </div>

      <hr className="rule" />

      <h2 className="section-title">최근 등록 자료</h2>
      {recent.length === 0 ? (
        <StatusBlock variant="empty" />
      ) : (
        <ul className="dash-recent">
          {recent.map((item) => (
            <li key={item.id}>
              <div className="dash-recent__row">
                <div className="dash-recent__thumb">
                  {item.image ? <img src={item.image} alt="" /> : <PlaceholderImage title={item.title} />}
                </div>
                <div>
                  <p>{item.title}</p>
                  <span className="footnote">{TYPE_LABEL[item.type]} · {item.date_text || item.year || '—'}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

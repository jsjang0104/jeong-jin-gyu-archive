import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSummary, getPoems, getArchiveItems, getTimeline } from '../api/archive';
import PlaceholderImage from '../components/PlaceholderImage.jsx';
import StatusBlock from '../components/StatusBlock.jsx';

const SECTION_TILES = [
  { type: 'MANUSCRIPT', label: '육필', hanja: '肉筆' },
  { type: 'ARTIFACT', label: '유품', hanja: '遺品' },
  { type: 'DOCUMENT', label: '문헌', hanja: '文獻' },
];

export default function Home() {
  const [status, setStatus] = useState('loading');
  const [summary, setSummary] = useState(null);
  const [featured, setFeatured] = useState(null);
  const [itemsByType, setItemsByType] = useState({});
  const [timelinePreview, setTimelinePreview] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [summaryData, featuredPoems, items, timeline] = await Promise.all([
          getSummary(),
          getPoems({ featured: 'true' }),
          getArchiveItems(),
          getTimeline(),
        ]);
        if (!alive) return;
        setSummary(summaryData);
        setFeatured(featuredPoems[0] || null);

        const grouped = {};
        items.forEach((item) => {
          if (!grouped[item.type]) grouped[item.type] = item;
        });
        setItemsByType(grouped);

        const step = Math.max(1, Math.floor(timeline.length / 4));
        setTimelinePreview(timeline.filter((_, i) => i % step === 0).slice(0, 4));

        setStatus('ready');
      } catch {
        if (alive) setStatus('error');
      }
    })();
    return () => { alive = false; };
  }, []);

  if (status === 'loading') return <StatusBlock variant="loading" />;
  if (status === 'error') return <StatusBlock variant="error" />;

  return (
    <>
      <section className="home-hero">
        <div className="container">
          <span className="eyebrow">Jeong Jin-gyu Literary Archive</span>
          <h1 className="headline">
            詩人 정진규<br />
            <span className="display-hanja">絅山 아카이브</span>
          </h1>
          <p className="home-hero__sub">몸의 詩學</p>
          <hr className="rule" />
          <p className="lede">
            산문시의 개척자, '몸시'와 '알시'로 독자적 시 양식을 세운 시인 정진규(1939–2017)의
            육필 원고와 유품, 문헌을 한 자리에 모았습니다.
          </p>
          <Link to="/archive" className="text-link">아카이브 둘러보기</Link>
        </div>
      </section>

      {featured && (
        <section className="section home-featured">
          <div className="container">
            <span className="eyebrow">Featured Poem</span>
            <h2 className="section-title">{featured.title}</h2>
            <p className="home-featured__excerpt">{featured.excerpt}</p>
            <Link to={`/poems/${featured.id}`} className="text-link">시 전문 보기</Link>
          </div>
        </section>
      )}

      <hr className="rule" />

      <section className="section">
        <div className="container">
          <span className="eyebrow">Explore</span>
          <div className="home-nav-grid">
            {SECTION_TILES.map((tile) => {
              const item = itemsByType[tile.type];
              const count = summary?.items?.[tile.type] ?? 0;
              return (
                <Link key={tile.type} to={`/archive?type=${tile.type}`} className="home-nav-tile img-hover-zoom">
                  <div className="home-nav-tile__image">
                    {item?.image ? (
                      <img src={item.image} alt={tile.label} />
                    ) : (
                      <PlaceholderImage titleHanja={tile.hanja} title={tile.label} />
                    )}
                  </div>
                  <div className="home-nav-tile__meta">
                    <span>{tile.label}</span>
                    <span className="mono-count">{count}</span>
                  </div>
                </Link>
              );
            })}
            <Link to="/collections" className="home-nav-tile img-hover-zoom">
              <div className="home-nav-tile__image">
                <PlaceholderImage titleHanja="詩集" title="시집" />
              </div>
              <div className="home-nav-tile__meta">
                <span>시집</span>
                <span className="mono-count">{summary?.collections ?? 0}</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <hr className="rule" />

      <section className="section">
        <div className="container">
          <span className="eyebrow">Timeline</span>
          <div className="home-timeline-preview">
            {timelinePreview.map((event) => (
              <div key={event.id} className="home-timeline-preview__item">
                <span className="display-hanja">{event.year}</span>
                <p>{event.title}</p>
              </div>
            ))}
          </div>
          <Link to="/timeline" className="text-link">연보 전체 보기</Link>
        </div>
      </section>
    </>
  );
}

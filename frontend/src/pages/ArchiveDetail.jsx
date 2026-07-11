import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getArchiveItem } from '../api/archive';
import PlaceholderImage from '../components/PlaceholderImage.jsx';
import StatusBlock from '../components/StatusBlock.jsx';

const TYPE_LABEL = { MANUSCRIPT: '육필', ARTIFACT: '유품', DOCUMENT: '문헌', PHOTO: '사진' };

export default function ArchiveDetail() {
  const { id } = useParams();
  const [status, setStatus] = useState('loading');
  const [item, setItem] = useState(null);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    getArchiveItem(id)
      .then((data) => { if (alive) { setItem(data); setStatus('ready'); } })
      .catch(() => { if (alive) setStatus('error'); });
    return () => { alive = false; };
  }, [id]);

  if (status === 'loading') return <StatusBlock variant="loading" />;
  if (status === 'error') return <StatusBlock variant="error" />;
  if (!item) return null;

  return (
    <section className="section archive-detail">
      <div className="container archive-detail__grid">
        <div className="archive-detail__image">
          {item.image ? (
            <img src={item.image} alt={item.title} />
          ) : (
            <PlaceholderImage title={item.title} />
          )}
        </div>
        <div className="archive-detail__body">
          <span className="eyebrow">{item.type_display || TYPE_LABEL[item.type]}</span>
          <h1 className="headline">{item.title}</h1>
          <ul className="archive-detail__meta">
            {item.date_text && <li>{item.date_text}</li>}
            {item.source && <li>{item.source}</li>}
          </ul>
          {item.description && <p className="lede">{item.description}</p>}

          {item.related_poem && (
            <p className="footnote">
              관련 시: <Link to={`/poems/${item.related_poem.id}`} className="text-link">{item.related_poem.title}</Link>
            </p>
          )}

          {item.ocr_text && (
            <>
              <hr className="rule" />
              <h2 className="section-title">판독 텍스트</h2>
              <p className="archive-detail__ocr">{item.ocr_text}</p>
            </>
          )}

          <Link to="/archive" className="text-link">아카이브로 돌아가기</Link>
        </div>
      </div>
    </section>
  );
}

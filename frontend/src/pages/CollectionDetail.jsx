import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCollection } from '../api/archive';
import PlaceholderImage from '../components/PlaceholderImage.jsx';
import StatusBlock from '../components/StatusBlock.jsx';

export default function CollectionDetail() {
  const { id } = useParams();
  const [status, setStatus] = useState('loading');
  const [collection, setCollection] = useState(null);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    getCollection(id)
      .then((data) => { if (alive) { setCollection(data); setStatus('ready'); } })
      .catch(() => { if (alive) setStatus('error'); });
    return () => { alive = false; };
  }, [id]);

  if (status === 'loading') return <StatusBlock variant="loading" />;
  if (status === 'error') return <StatusBlock variant="error" />;
  if (!collection) return null;

  return (
    <section className="section collection-detail">
      <div className="container collection-detail__grid">
        <div className="collection-detail__cover">
          {collection.cover_image ? (
            <img src={collection.cover_image} alt={collection.title} />
          ) : (
            <PlaceholderImage title={collection.title} titleHanja={collection.title_hanja} />
          )}
        </div>
        <div className="collection-detail__body">
          <span className="eyebrow">Collection</span>
          <h1 className="headline">{collection.title}</h1>
          {collection.title_hanja && <p className="display-hanja">{collection.title_hanja}</p>}
          <ul className="collection-detail__bibliography">
            {collection.year && <li>{collection.year}</li>}
            {collection.publisher && <li>{collection.publisher}</li>}
          </ul>
          {collection.description && <p className="lede">{collection.description}</p>}

          <hr className="rule" />

          <h2 className="section-title">수록 시</h2>
          {collection.poems && collection.poems.length > 0 ? (
            <ul className="collection-detail__poems">
              {collection.poems.map((poem) => (
                <li key={poem.id}>
                  <Link to={`/poems/${poem.id}`} className="collection-detail__poem-link">
                    <span>{poem.title}</span>
                    {poem.year && <span className="footnote">{poem.year}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="footnote">등록된 수록 시가 없습니다.</p>
          )}

          <Link to="/collections" className="text-link">시집 목록으로</Link>
        </div>
      </div>
    </section>
  );
}

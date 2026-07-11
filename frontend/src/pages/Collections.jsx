import { useEffect, useState } from 'react';
import { getCollections } from '../api/archive';
import CollectionCard from '../components/CollectionCard.jsx';
import StatusBlock from '../components/StatusBlock.jsx';

export default function Collections() {
  const [status, setStatus] = useState('loading');
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    let alive = true;
    getCollections()
      .then((data) => { if (alive) { setCollections(data); setStatus('ready'); } })
      .catch(() => { if (alive) setStatus('error'); });
    return () => { alive = false; };
  }, []);

  return (
    <section className="section collections-page">
      <div className="container">
        <span className="eyebrow">Collections</span>
        <h1 className="headline">시집</h1>
        <p className="lede">1965년 『마른 수수깡의 평화』부터 2017년 유고 시집 『모르는 귀』까지.</p>
        <hr className="rule" />

        {status === 'loading' && <StatusBlock variant="loading" />}
        {status === 'error' && <StatusBlock variant="error" />}
        {status === 'ready' && collections.length === 0 && <StatusBlock variant="empty" />}
        {status === 'ready' && collections.length > 0 && (
          <div className="grid grid-4 collections-grid">
            {collections.map((c) => (
              <CollectionCard key={c.id} collection={c} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

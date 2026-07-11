import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPoem } from '../api/archive';
import StatusBlock from '../components/StatusBlock.jsx';

export default function PoemDetail() {
  const { id } = useParams();
  const [status, setStatus] = useState('loading');
  const [poem, setPoem] = useState(null);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    getPoem(id)
      .then((data) => { if (alive) { setPoem(data); setStatus('ready'); } })
      .catch(() => { if (alive) setStatus('error'); });
    return () => { alive = false; };
  }, [id]);

  if (status === 'loading') return <StatusBlock variant="loading" />;
  if (status === 'error') return <StatusBlock variant="error" />;
  if (!poem) return null;

  return (
    <section className="section poem-detail">
      <div className="container poem-detail__container">
        <span className="eyebrow">{poem.collection?.title || 'Poem'}{poem.year ? ` · ${poem.year}` : ''}</span>
        <h1 className="headline">{poem.title}</h1>
        <hr className="rule" />
        <p className="poem-detail__body">{poem.body}</p>

        {(poem.notes || poem.collection) && <hr className="rule" />}

        {poem.collection && (
          <p className="footnote">
            출전: <Link to={`/collections/${poem.collection.id}`} className="text-link">{poem.collection.title}</Link>
          </p>
        )}
        {poem.notes && <p className="poem-detail__notes footnote">{poem.notes}</p>}

        <Link to="/poems" className="text-link poem-detail__back">시 목록으로</Link>
      </div>
    </section>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { getTimeline } from '../api/archive';
import StatusBlock from '../components/StatusBlock.jsx';

export default function Timeline() {
  const [status, setStatus] = useState('loading');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let alive = true;
    getTimeline()
      .then((data) => { if (alive) { setEvents(data); setStatus('ready'); } })
      .catch(() => { if (alive) setStatus('error'); });
    return () => { alive = false; };
  }, []);

  const decades = useMemo(() => {
    const set = new Set(events.map((e) => Math.floor(e.year / 10) * 10));
    return [...set].sort((a, b) => a - b);
  }, [events]);

  if (status === 'loading') return <StatusBlock variant="loading" />;
  if (status === 'error') return <StatusBlock variant="error" />;

  return (
    <section className="section timeline-page">
      <div className="container">
        <span className="eyebrow">Timeline</span>
        <h1 className="headline">연보</h1>

        {decades.length > 0 && (
          <nav className="timeline-page__jump">
            {decades.map((d) => (
              <a key={d} href={`#decade-${d}`} className="text-link">{d}s</a>
            ))}
          </nav>
        )}

        <hr className="rule" />

        {events.length === 0 ? (
          <StatusBlock variant="empty" />
        ) : (
          <ol className="timeline-list">
            {events.map((event, idx) => {
              const decade = Math.floor(event.year / 10) * 10;
              const isDecadeStart = idx === 0 || Math.floor(events[idx - 1].year / 10) * 10 !== decade;
              return (
                <li key={event.id} id={isDecadeStart ? `decade-${decade}` : undefined} className="timeline-list__item">
                  <div className="timeline-list__year">
                    <span className="display-hanja">{event.year}</span>
                    {event.month && <span className="footnote">{event.month}월</span>}
                  </div>
                  <div className="timeline-list__body">
                    <h3>{event.title}</h3>
                    {event.description && <p>{event.description}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}

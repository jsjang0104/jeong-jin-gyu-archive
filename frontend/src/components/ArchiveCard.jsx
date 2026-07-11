import { Link } from 'react-router-dom';
import PlaceholderImage from './PlaceholderImage.jsx';

const TYPE_LABEL = { MANUSCRIPT: '육필', ARTIFACT: '유품', DOCUMENT: '문헌', PHOTO: '사진' };

export default function ArchiveCard({ item }) {
  return (
    <Link to={`/archive/${item.id}`} className="archive-card img-hover-zoom">
      <div className="archive-card__image">
        {item.image ? (
          <img src={item.image} alt={item.title} />
        ) : (
          <PlaceholderImage title={item.title} />
        )}
      </div>
      <div className="archive-card__meta">
        <span className="eyebrow">{item.type_display || TYPE_LABEL[item.type]}</span>
        <h3>{item.title}</h3>
        {item.date_text && <span className="footnote">{item.date_text}</span>}
      </div>
    </Link>
  );
}

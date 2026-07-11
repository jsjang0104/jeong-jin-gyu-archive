import { Link } from 'react-router-dom';
import PlaceholderImage from './PlaceholderImage.jsx';

export default function CollectionCard({ collection }) {
  return (
    <Link to={`/collections/${collection.id}`} className="collection-card img-hover-zoom">
      <div className="collection-card__image">
        {collection.cover_image ? (
          <img src={collection.cover_image} alt={collection.title} />
        ) : (
          <PlaceholderImage title={collection.title} titleHanja={collection.title_hanja} />
        )}
      </div>
      <div className="collection-card__meta">
        <span className="footnote">{collection.year}</span>
        <h3>{collection.title}</h3>
        {collection.publisher && <span className="footnote">{collection.publisher}</span>}
      </div>
    </Link>
  );
}

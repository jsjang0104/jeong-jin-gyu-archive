import './PlaceholderImage.css';

export default function PlaceholderImage({ title, titleHanja, className = '' }) {
  const source = (titleHanja && titleHanja.trim()) || (title && title.trim()) || '絅';
  const char = Array.from(source)[0];
  return (
    <div className={`placeholder-image ${className}`} aria-hidden="true">
      <span>{char}</span>
    </div>
  );
}

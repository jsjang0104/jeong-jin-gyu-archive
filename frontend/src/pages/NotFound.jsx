import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section not-found">
      <div className="container">
        <span className="eyebrow">404</span>
        <h1 className="headline">페이지를 찾을 수 없습니다</h1>
        <p className="lede">주소를 다시 확인해 주시거나, 아카이브 홈으로 돌아가 주세요.</p>
        <Link to="/" className="text-link">홈으로 돌아가기</Link>
      </div>
    </section>
  );
}

import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="footnote">© {new Date().getFullYear()} 정진규 아카이브</p>
        <p className="footnote">자료 출처: 유족 소장 자료</p>
      </div>
    </footer>
  );
}

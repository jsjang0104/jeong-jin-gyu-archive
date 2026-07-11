import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="footnote">© {new Date().getFullYear()} 정진규 아카이브</p>
        <p className="footnote">자료 출처: 정민영 교수님 소장 자료</p>
        <p className="footnote">제작 · 관리: 장지수 (한국외국어대학교 독일어과 24) · <a href="mailto:jsjang07028@gmail.com">jsjang07028@gmail.com</a></p>
      </div>
    </footer>
  );
}

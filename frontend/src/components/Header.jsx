import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';

const NAV_ITEMS = [
  { to: '/archive', label: '아카이브' },
  { to: '/poems', label: '시' },
  { to: '/collections', label: '시집' },
  { to: '/timeline', label: '연보' },
  { to: '/about', label: '시인 소개' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__logo" onClick={() => setOpen(false)}>
          <span className="site-header__logo-hanja">絅山</span>
          <span className="site-header__logo-text">정진규 아카이브</span>
        </Link>

        <button
          className="site-header__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label="메뉴 열기"
          aria-expanded={open}
        >
          <span />
          <span />
        </button>

        <nav className={`site-header__nav ${open ? 'is-open' : ''}`}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `site-header__link ${isActive ? 'is-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

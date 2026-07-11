import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV = [
  { to: '/manage', label: '대시보드', end: true },
  { to: '/manage/items', label: '아카이브 자료' },
  { to: '/manage/ai-upload', label: 'AI 자동 등록' },
  { to: '/manage/poems', label: '시' },
  { to: '/manage/collections', label: '시집' },
  { to: '/manage/timeline', label: '연보' },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-sidebar__brand">
          <span className="display-hanja">絅山</span>
          <span>정진규 아카이브</span>
        </Link>
        <nav className="admin-sidebar__nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-sidebar__link ${isActive ? 'is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="text-link admin-sidebar__logout" onClick={logout}>로그아웃</button>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

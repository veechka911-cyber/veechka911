import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Layout({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const onHistory = loc.pathname === '/history';
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <Link to="/" className="topbar__logo">
            <span className="topbar__logo-mark" aria-hidden>
              <PlateIcon size={18} />
            </span>
            <span>Умная тарелка</span>
          </Link>
          <div className="topbar__spacer" />
          {!onHistory && (
            <Link to="/history" className="topbar__link">
              История
            </Link>
          )}
        </div>
      </header>
      <main className="container">{children}</main>
      <footer className="app-footer">
        <div>© Умная тарелка — примерный фото-разбор еды без жёсткого подсчёта калорий.</div>
        <div className="legal-links" style={{ justifyContent: 'center' }}>
          <Link to="/policy">Политика обработки персональных данных</Link>
          <Link to="/terms">Пользовательское соглашение</Link>
        </div>
      </footer>
    </div>
  );
}

function PlateIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#7a8b5a" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="6" fill="#c7d4ad" />
      <circle cx="12" cy="12" r="2.2" fill="#fbf7f1" />
    </svg>
  );
}

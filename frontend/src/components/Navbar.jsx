import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 48px',
    height: '58px',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    background: 'rgba(7,11,20,0.92)',
    backdropFilter: 'blur(16px)',
    zIndex: 99,
    flexShrink: 0,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  blob: {
    width: '22px',
    height: '22px',
    background: 'var(--lava)',
    borderRadius: '50% 40% 60% 45% / 50% 60% 40% 55%',
    animation: 'blobFloat 4s ease-in-out infinite',
    flexShrink: 0,
  },
  wordmark: {
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '-0.3px',
    color: 'var(--text)',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: 'var(--green)',
    boxShadow: '0 0 6px var(--green)',
    animation: 'pulse 2.5s ease-in-out infinite',
  },
  statusText: {
    fontFamily: 'var(--m)',
    fontSize: '11px',
    color: 'var(--text-3)',
    letterSpacing: '0.5px',
  },
};

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkStyle = (path) => ({
    padding: '6px 14px',
    borderRadius: 'var(--r-sm)',
    fontSize: '14px',
    fontWeight: 500,
    color: location.pathname === path ? 'var(--text)' : 'var(--text-2)',
    background: location.pathname === path ? 'var(--raised)' : 'transparent',
    textDecoration: 'none',
    transition: 'all 0.15s',
  });

  return (
    <>
      <style>{`
        @keyframes blobFloat {
          0%,100% { border-radius: 50% 40% 60% 45% / 50% 60% 40% 55%; transform: translateY(0); }
          33%      { border-radius: 60% 50% 40% 55% / 40% 50% 60% 45%; transform: translateY(-3px); }
          66%      { border-radius: 40% 60% 55% 40% / 60% 40% 50% 60%; transform: translateY(2px); }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .nav-link:hover {
          color: var(--text) !important;
          background: var(--raised) !important;
        }
      `}</style>

      <nav style={{
        ...styles.nav,
        borderBottomColor: scrolled ? 'var(--border-hi)' : 'var(--border)',
      }}>
        <Link to="/" style={styles.brand}>
          <div style={styles.blob} />
          <span style={styles.wordmark}>
            Lava<span style={{ color: 'var(--lava)' }}>Rand</span>
          </span>
        </Link>

        <div style={styles.links}>
          <Link to="/"           className="nav-link" style={linkStyle('/')}>Home</Link>
          <Link to="/docs"       className="nav-link" style={linkStyle('/docs')}>Docs</Link>
          <Link to="/playground" className="nav-link" style={linkStyle('/playground')}>Playground</Link>
          <Link to="/admin"      className="nav-link" style={linkStyle('/admin')}>Admin</Link>
        </div>

        <div style={styles.status}>
          <div style={styles.statusDot} />
          <span style={styles.statusText}>AES-256-GCM</span>
        </div>
      </nav>
    </>
  );
}
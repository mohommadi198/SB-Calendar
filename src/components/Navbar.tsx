import React from 'react';

interface NavbarProps {
  deferredPrompt: any;
  onInstall: () => void;
  isAdmin?: boolean | null;
}

const Navbar: React.FC<NavbarProps> = ({ deferredPrompt, onInstall, isAdmin }) => {
  const currentPath = window.location.pathname;

  return (
    <nav className="navbar">
      <div className="nav-logo-area">
        <h1 className="app-title-mini">SB</h1>
      </div>

      <div className="nav-links-group">
        <a href="/" className={`nav-link ${currentPath === '/' ? 'active' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          </svg>
          <span>Today</span>
        </a>
        <a href="/explore" className={`nav-link ${currentPath === '/explore' ? 'active' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Explore</span>
        </a>
        
        {deferredPrompt && (
          <button onClick={onInstall} className="nav-link-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Install</span>
          </button>
        )}

        {isAdmin && (
          <a href="/admin/dashboard" className={`nav-link ${currentPath.includes('/admin') ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Admin</span>
          </a>
        )}

      </div>

      {/* Placeholder to balance the Logo on the left if Install/Admin is hidden */}
      {(!deferredPrompt && !isAdmin) && <div className="nav-logo-area" style={{ opacity: 0 }}>SB</div>}
    </nav>
  );
};

export default Navbar;

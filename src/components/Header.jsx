import React from 'react';

function Header({ onShare, onMenuToggle, unsharedCount }) {
  return (
    <header className="header">
      <h1>🔋 EFF BATT</h1>
      <div className="header-actions">
        <button className="header-btn" onClick={onShare} title="Condividi report">
          📤
          {unsharedCount > 0 && (
            <span className="badge-count">{unsharedCount > 99 ? '99+' : unsharedCount}</span>
          )}
        </button>
        <button className="header-btn" onClick={onMenuToggle} title="Menu">
          ☰
        </button>
      </div>
    </header>
  );
}

export default Header;

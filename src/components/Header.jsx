import React from 'react';

function Header({ onShare, onMenuToggle }) {
  return (
    <header className="header">
      <h1>🔋 EFF BATT</h1>
      <div className="header-actions">
        <button className="header-btn" onClick={onShare} title="Condividi report">
          📤
        </button>
        <button className="header-btn" onClick={onMenuToggle} title="Menu">
          ☰
        </button>
      </div>
    </header>
  );
}

export default Header;

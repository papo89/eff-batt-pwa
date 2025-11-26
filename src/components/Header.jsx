import React from 'react';

function Header({ onShare }) {
  return (
    <header className="header">
      <h1>🔋 EFF BATT</h1>
      <div className="header-actions">
        <button className="header-btn" onClick={onShare} title="Condividi report">
          📤
        </button>
      </div>
    </header>
  );
}

export default Header;

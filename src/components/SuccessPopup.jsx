import React from 'react';
import { vibrateShort } from '../utils/feedback';

function SuccessPopup({ show, onShare, onHome }) {
  if (!show) return null;

  const handleShare = () => {
    vibrateShort();
    onShare();
  };

  const handleHome = () => {
    vibrateShort();
    onHome();
  };

  return (
    <div className="success-popup-overlay">
      <div className="success-popup-content">
        <div className="success-popup-icon">✅</div>
        <h3>Report compilato correttamente</h3>
        <p>Cosa vuoi fare?</p>
        
        <div className="success-popup-buttons">
          <button className="success-popup-btn share" onClick={handleShare}>
            <span className="success-popup-btn-icon">📤</span>
            <span>Condividi</span>
          </button>
          <button className="success-popup-btn home" onClick={handleHome}>
            <span className="success-popup-btn-icon">🏠</span>
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessPopup;

import React, { useState } from 'react';
import SettingsModal from './SettingsModal';
import StrumentiManager from './StrumentiManager';
import Dashboard from './Dashboard';

function HamburgerMenu({ show, onClose, settings, onUpdateSettings }) {
  const [activeModal, setActiveModal] = useState(null);

  const handleMenuClick = (modal) => {
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  if (!show) return null;

  return (
    <>
      <div className="hamburger-menu show">
        <div className="hamburger-backdrop" onClick={onClose}></div>
        <div className="hamburger-content">
          <div className="hamburger-header">
            <h3>☰ Menu</h3>
            <button className="hamburger-close" onClick={onClose}>✕</button>
          </div>

          <div className="hamburger-items">
            <div 
              className="hamburger-item"
              onClick={() => handleMenuClick('aspetto')}
            >
              <span className="hamburger-icon">🎨</span>
              <span className="hamburger-label">Aspetto e Accessibilità</span>
              <span className="hamburger-arrow">›</span>
            </div>

            <div 
              className="hamburger-item"
              onClick={() => handleMenuClick('strumenti')}
            >
              <span className="hamburger-icon">🛠️</span>
              <span className="hamburger-label">Gestione Strumenti</span>
              <span className="hamburger-arrow">›</span>
            </div>

            <div 
              className="hamburger-item"
              onClick={() => handleMenuClick('dashboard')}
            >
              <span className="hamburger-icon">📊</span>
              <span className="hamburger-label">Dashboard</span>
              <span className="hamburger-arrow">›</span>
            </div>

            <div className="hamburger-divider"></div>

            <div className="hamburger-section-title">⚙️ Impostazioni</div>
            
            <div className="hamburger-item toggle">
              <span className="hamburger-icon">📳</span>
              <div className="hamburger-item-content">
                <span className="hamburger-label">Vibrazione feedback</span>
                <span className="hamburger-sublabel">Vibra su PDF generato, errori</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.vibrationEnabled}
                  onChange={(e) => onUpdateSettings({ ...settings, vibrationEnabled: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="hamburger-item toggle">
              <span className="hamburger-icon">📱</span>
              <div className="hamburger-item-content">
                <span className="hamburger-label">Schermo sempre acceso</span>
                <span className="hamburger-sublabel">Durante compilazione form</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.keepScreenOn}
                  onChange={(e) => onUpdateSettings({ ...settings, keepScreenOn: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="hamburger-footer">
            <span>v1.1.0</span>
          </div>
        </div>
      </div>

      {activeModal === 'aspetto' && (
        <SettingsModal
          settings={settings}
          onSave={(newSettings) => {
            onUpdateSettings(newSettings);
            closeModal();
          }}
          onClose={closeModal}
        />
      )}

      {activeModal === 'strumenti' && (
        <StrumentiManager onClose={closeModal} />
      )}

      {activeModal === 'dashboard' && (
        <Dashboard onClose={closeModal} />
      )}
    </>
  );
}

export default HamburgerMenu;

import React, { useState } from 'react';
import { vibrateShort } from '../utils/feedback';

function SettingsModal({ settings, onSave, onClose }) {
  const [localSettings, setLocalSettings] = useState({ ...settings });

  const handleThemeChange = (theme) => {
    vibrateShort();
    setLocalSettings(prev => ({ ...prev, theme }));
  };

  const handleTextSizeChange = (textSize) => {
    vibrateShort();
    setLocalSettings(prev => ({ ...prev, textSize }));
  };

  const handleBoldChange = (e) => {
    vibrateShort();
    setLocalSettings(prev => ({ ...prev, boldText: e.target.checked }));
  };

  const handleSave = () => {
    vibrateShort();
    onSave(localSettings);
  };

  return (
    <div className="modal-overlay show">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>🎨 Aspetto e Accessibilità</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Tema */}
          <div className="settings-section">
            <label className="settings-label">Tema</label>
            <div className="settings-options theme-options">
              <button
                className={`theme-btn ${localSettings.theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
              >
                <span className="theme-icon">☀️</span>
                <span>Chiaro</span>
              </button>
              <button
                className={`theme-btn ${localSettings.theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
              >
                <span className="theme-icon">🌙</span>
                <span>Scuro</span>
              </button>
              <button
                className={`theme-btn ${localSettings.theme === 'auto' ? 'active' : ''}`}
                onClick={() => handleThemeChange('auto')}
              >
                <span className="theme-icon">⚙️</span>
                <span>Auto</span>
              </button>
            </div>
          </div>

          {/* Dimensione testo */}
          <div className="settings-section">
            <label className="settings-label">Dimensione testo</label>
            <div className="settings-options text-size-options">
              <button
                className={`text-size-btn ${localSettings.textSize === 'small' ? 'active' : ''}`}
                onClick={() => handleTextSizeChange('small')}
              >
                <span className="text-size-preview small">A</span>
                <span>Piccolo</span>
              </button>
              <button
                className={`text-size-btn ${localSettings.textSize === 'normal' ? 'active' : ''}`}
                onClick={() => handleTextSizeChange('normal')}
              >
                <span className="text-size-preview normal">A</span>
                <span>Normale</span>
              </button>
              <button
                className={`text-size-btn ${localSettings.textSize === 'large' ? 'active' : ''}`}
                onClick={() => handleTextSizeChange('large')}
              >
                <span className="text-size-preview large">A</span>
                <span>Grande</span>
              </button>
            </div>
          </div>

          {/* Grassetto */}
          <div className="settings-section">
            <label className="settings-toggle">
              <span className="settings-toggle-label">Grassetto testo</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localSettings.boldText}
                  onChange={handleBoldChange}
                />
                <span className="toggle-slider"></span>
              </label>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Annulla
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            💾 Salva
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;

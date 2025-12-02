import React, { useState, useEffect } from 'react';
import SettingsModal from './SettingsModal';
import StrumentiManager from './StrumentiManager';
import Dashboard from './Dashboard';
import StoricoModal from './StoricoModal';
import { getSharedReportsCount } from '../utils/storage';
import { initNotifications, stopNotifications } from '../utils/notifications';
import { vibrateShort } from '../utils/feedback';

function HamburgerMenu({ show, onClose, settings, onUpdateSettings, showToast }) {
  const [activeModal, setActiveModal] = useState(null);
  const [storicoCount, setStoricoCount] = useState(0);

  useEffect(() => {
    if (show) {
      loadStoricoCount();
    }
  }, [show]);

  const loadStoricoCount = async () => {
    const count = await getSharedReportsCount();
    setStoricoCount(count);
  };

  const handleMenuClick = (modal) => {
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
    loadStoricoCount();
  };

  const handleNotificationToggle = (enabled) => {
    vibrateShort();
    onUpdateSettings({ ...settings, notificationsEnabled: enabled });
    if (enabled) {
      initNotifications();
    } else {
      stopNotifications();
    }
  };

  const updateNotificationTime = (type, field, value) => {
    vibrateShort();
    const timeKey = type === 'workday' ? 'notificationTimeWorkday' : 'notificationTimeHoliday';
    const currentTime = settings[timeKey] || { hour: 12, minute: 0 };
    const newTime = { ...currentTime, [field]: parseInt(value, 10) };
    onUpdateSettings({ ...settings, [timeKey]: newTime });
    
    // Rischedula notifiche con nuovo orario
    if (settings.notificationsEnabled) {
      stopNotifications();
      setTimeout(() => initNotifications(), 100);
    }
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
              onClick={() => handleMenuClick('storico')}
            >
              <span className="hamburger-icon">📚</span>
              <span className="hamburger-label">
                Storico
                {storicoCount > 0 && (
                  <span className="hamburger-badge">({storicoCount})</span>
                )}
              </span>
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

            <div className="hamburger-item toggle">
              <span className="hamburger-icon">🔔</span>
              <div className="hamburger-item-content">
                <span className="hamburger-label">Notifiche report</span>
                <span className="hamburger-sublabel">Promemoria report da inviare</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => handleNotificationToggle(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {settings.notificationsEnabled && (
              <div className="notification-times">
                <div className="time-setting">
                  <label>Giorni lavorativi</label>
                  <div className="time-inputs">
                    <select 
                      value={settings.notificationTimeWorkday?.hour || 15}
                      onChange={(e) => updateNotificationTime('workday', 'hour', e.target.value)}
                    >
                      {[...Array(24)].map((_, i) => (
                        <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                      ))}
                    </select>
                    <span>:</span>
                    <select
                      value={settings.notificationTimeWorkday?.minute || 15}
                      onChange={(e) => updateNotificationTime('workday', 'minute', e.target.value)}
                    >
                      {[0, 15, 30, 45].map((m) => (
                        <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="time-setting">
                  <label>Festivi / Weekend</label>
                  <div className="time-inputs">
                    <select
                      value={settings.notificationTimeHoliday?.hour || 12}
                      onChange={(e) => updateNotificationTime('holiday', 'hour', e.target.value)}
                    >
                      {[...Array(24)].map((_, i) => (
                        <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                      ))}
                    </select>
                    <span>:</span>
                    <select
                      value={settings.notificationTimeHoliday?.minute || 50}
                      onChange={(e) => updateNotificationTime('holiday', 'minute', e.target.value)}
                    >
                      {[0, 15, 30, 45].map((m) => (
                        <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hamburger-footer">
            <span>v2.0.3</span>
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

      {activeModal === 'storico' && (
        <StoricoModal onClose={closeModal} showToast={showToast} />
      )}

      {activeModal === 'dashboard' && (
        <Dashboard onClose={closeModal} />
      )}
    </>
  );
}

export default HamburgerMenu;

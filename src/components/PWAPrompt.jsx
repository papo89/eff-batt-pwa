import React, { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function PWAPrompt() {
  const [showBanner, setShowBanner] = useState(false);
  
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW registrato:', r);
    },
    onRegisterError(error) {
      console.error('Errore registrazione SW:', error);
    }
  });

  // Mostra banner quando c'è aggiornamento
  useEffect(() => {
    if (needRefresh) {
      setShowBanner(true);
    }
  }, [needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleClose = () => {
    setShowBanner(false);
    setNeedRefresh(false);
  };

  if (!showBanner) return null;

  return (
    <div className="update-banner" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#1a73e8',
      color: 'white',
      padding: '16px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 9999,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.3)'
    }}>
      <p style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>🔄 Nuova versione disponibile!</p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={handleClose} 
          style={{ 
            background: 'transparent', 
            color: 'white',
            border: '1px solid white',
            padding: '10px 16px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Dopo
        </button>
        <button 
          onClick={handleUpdate}
          style={{ 
            background: 'white', 
            color: '#1a73e8',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Aggiorna
        </button>
      </div>
    </div>
  );
}

export default PWAPrompt;

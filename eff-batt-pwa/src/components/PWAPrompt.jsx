import React, { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function PWAPrompt() {
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

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleClose = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="update-banner">
      <p>🔄 Nuova versione disponibile!</p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleClose} style={{ background: 'transparent', color: 'white' }}>
          Dopo
        </button>
        <button onClick={handleUpdate}>
          Aggiorna
        </button>
      </div>
    </div>
  );
}

export default PWAPrompt;

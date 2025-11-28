import React, { useState } from 'react';
import { validaNumeroVeicolo } from '../utils/validation';
import { vibrateShort, vibrateError } from '../utils/feedback';

function VehicleModal({ vehicle, sedeVeicoliCount, onSave, onCancel, showToast }) {
  const [numero, setNumero] = useState(vehicle?.numero || '');
  const [tipo, setTipo] = useState(vehicle?.tipo || '3M');

  const handleSave = () => {
    if (!numero.trim()) {
      vibrateError();
      showToast('Inserisci il numero del veicolo', 'danger');
      return;
    }
    
    // Validazione EVN
    const risultato = validaNumeroVeicolo(numero.trim());
    if (!risultato.valido) {
      vibrateError();
      showToast(risultato.errore, 'danger');
      return;
    }
    
    if (!vehicle && sedeVeicoliCount >= 8) {
      vibrateError();
      showToast('Massimo 8 veicoli per sede', 'danger');
      return;
    }
    
    vibrateShort();
    // Salva con numero formattato (con trattino)
    onSave({ numero: risultato.formattato, tipo });
  };

  return (
    <div className="share-modal show">
      <div className="share-modal-backdrop" onClick={onCancel}></div>
      <div className="share-modal-content">
        <h3>🚃 {vehicle ? 'Modifica Veicolo' : 'Nuovo Veicolo'}</h3>
        
        <div className="form-group">
          <label>Numero Veicolo (12 cifre)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="508321876056"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            autoFocus
          />
        </div>
        
        <div className="form-group">
          <label>Tipo Scadenza</label>
          <div className="esito-buttons" style={{ marginTop: '8px' }}>
            <button
              className={`esito-btn ${tipo === '3M' ? 'selected positivo' : ''}`}
              onClick={() => setTipo('3M')}
            >
              3 Mesi
            </button>
            <button
              className={`esito-btn ${tipo === '6M' ? 'selected negativo' : ''}`}
              onClick={() => setTipo('6M')}
            >
              6 Mesi
            </button>
          </div>
        </div>

        <div className="share-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
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

export default VehicleModal;

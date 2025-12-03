import React, { useState } from 'react';
import { validaNumeroVeicolo } from '../utils/validation';
import { vibrateShort, vibrateError } from '../utils/feedback';

function VehicleModal({ vehicle, sedeVeicoliCount, onSave, onCancel, showToast }) {
  const [numero, setNumero] = useState(vehicle?.numero || '');
  
  // Gestione tipo con checkbox multipli
  const getTipoFromVehicle = () => {
    if (!vehicle?.tipo) return { is3M: false, is6M: false }; // Nuovo veicolo: entrambi deselezionati
    return {
      is3M: vehicle.tipo.includes('3M'),
      is6M: vehicle.tipo.includes('6M')
    };
  };
  
  const [is3M, setIs3M] = useState(getTipoFromVehicle().is3M);
  const [is6M, setIs6M] = useState(getTipoFromVehicle().is6M);

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
    
    // Almeno un tipo deve essere selezionato
    if (!is3M && !is6M) {
      vibrateError();
      showToast('Seleziona almeno un tipo di verifica', 'danger');
      return;
    }
    
    if (!vehicle && sedeVeicoliCount >= 8) {
      vibrateError();
      showToast('Massimo 8 veicoli per sede', 'danger');
      return;
    }
    
    // Determina tipo finale
    let tipo;
    if (is3M && is6M) {
      tipo = '3M6M';
    } else if (is3M) {
      tipo = '3M';
    } else {
      tipo = '6M';
    }
    
    vibrateShort();
    onSave({ numero: risultato.formattato, tipo });
  };

  const handleToggle3M = () => {
    vibrateShort();
    setIs3M(!is3M);
  };

  const handleToggle6M = () => {
    vibrateShort();
    setIs6M(!is6M);
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
          <label>Tipo Verifica (seleziona uno o entrambi)</label>
          <div className="tipo-checkboxes">
            <div 
              className={`tipo-checkbox ${is3M ? 'selected' : ''}`}
              onClick={handleToggle3M}
            >
              <span className="tipo-check">{is3M ? '☑️' : '☐'}</span>
              <span className="tipo-label">3 Mesi</span>
            </div>
            <div 
              className={`tipo-checkbox ${is6M ? 'selected' : ''}`}
              onClick={handleToggle6M}
            >
              <span className="tipo-check">{is6M ? '☑️' : '☐'}</span>
              <span className="tipo-label">6 Mesi</span>
            </div>
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

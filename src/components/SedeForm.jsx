import React, { useState } from 'react';
import { validaODL } from '../utils/validation';
import { vibrateShort, vibrateError } from '../utils/feedback';

function SedeForm({ sede, onSave, onCancel, showToast }) {
  const [nome, setNome] = useState(sede?.nome || '');
  const [odl, setOdl] = useState(sede?.odl || '');

  const handleSave = () => {
    if (!nome.trim()) {
      vibrateError();
      showToast('Inserisci il nome della sede', 'danger');
      return;
    }
    
    if (odl.trim()) {
      const risultatoODL = validaODL(odl.trim());
      if (!risultatoODL.valido) {
        vibrateError();
        showToast(risultatoODL.errore, 'danger');
        return;
      }
    }
    
    vibrateShort();
    onSave({ nome: nome.trim(), odl: odl.trim() });
  };

  return (
    <div className="container">
      <span className="back-link" onClick={onCancel}>← Indietro</span>
      
      <div className="card">
        <h2>🚃🚃🚃 {sede ? 'Modifica Sede Tecnica' : 'Nuova Sede Tecnica'}</h2>
        
        <div className="form-group">
          <label>Nome Sede Tecnica</label>
          <input
            type="text"
            placeholder="MAxxMD.... o C3010R"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>ODL</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="100012345678"
            value={odl}
            onChange={(e) => setOdl(e.target.value)}
          />
        </div>

        <div className="nav-buttons">
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

export default SedeForm;

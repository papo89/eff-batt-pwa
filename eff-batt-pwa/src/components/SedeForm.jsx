import React, { useState } from 'react';

function SedeForm({ sede, onSave, onCancel }) {
  const [nome, setNome] = useState(sede?.nome || '');
  const [odl, setOdl] = useState(sede?.odl || '');

  const handleSave = () => {
    if (!nome.trim()) {
      alert('Inserisci il nome della sede');
      return;
    }
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
            placeholder="123456"
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

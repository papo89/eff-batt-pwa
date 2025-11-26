import React from 'react';

function PdfSetup({ onUpload }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="container">
      <div className="card setup-box">
        <h2>📄 Configurazione Iniziale</h2>
        <p>Carica il PDF template per iniziare</p>
        
        <div className="file-input-wrapper">
          <button className="btn btn-primary">
            📁 Seleziona PDF Template
          </button>
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange}
          />
        </div>

        <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-light)' }}>
          Il PDF template verrà salvato nel dispositivo e sarà disponibile anche offline.
        </p>
      </div>
    </div>
  );
}

export default PdfSetup;

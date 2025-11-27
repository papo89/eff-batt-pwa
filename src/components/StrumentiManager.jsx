import React, { useState, useEffect } from 'react';
import { getStrumenti, saveStrumento, updateStrumento, deleteStrumento } from '../utils/storage';
import { vibrateShort, vibrateSuccess } from '../utils/feedback';

function StrumentiManager({ onClose }) {
  const [strumenti, setStrumenti] = useState([]);
  const [editingStrumento, setEditingStrumento] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nome: '', idStrumento: '', scadenza: '', tipo: 'multimetro' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStrumenti();
  }, []);

  const loadStrumenti = async () => {
    setLoading(true);
    const data = await getStrumenti();
    setStrumenti(data);
    setLoading(false);
  };

  const multimetri = strumenti.filter(s => s.tipo === 'multimetro');
  const densimetri = strumenti.filter(s => s.tipo === 'densimetro');

  const handleAdd = (tipo) => {
    vibrateShort();
    setEditingStrumento(null);
    setFormData({ nome: '', idStrumento: '', scadenza: '', tipo });
    setShowForm(true);
  };

  const handleEdit = (strumento) => {
    vibrateShort();
    setEditingStrumento(strumento);
    setFormData({
      nome: strumento.nome || '',
      idStrumento: strumento.idStrumento,
      scadenza: strumento.scadenza,
      tipo: strumento.tipo
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Eliminare questo strumento?')) {
      vibrateShort();
      await deleteStrumento(id);
      loadStrumenti();
    }
  };

  const handleSave = async () => {
    if (!formData.idStrumento.trim()) {
      alert('Inserisci l\'ID dello strumento');
      return;
    }
    if (!formData.scadenza) {
      alert('Inserisci la data di scadenza');
      return;
    }

    vibrateSuccess();

    if (editingStrumento) {
      await updateStrumento(editingStrumento.id, formData);
    } else {
      await saveStrumento(formData);
    }

    setShowForm(false);
    setEditingStrumento(null);
    loadStrumenti();
  };

  const handleCancel = () => {
    vibrateShort();
    setShowForm(false);
    setEditingStrumento(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const renderStrumentoCard = (strumento) => (
    <div className="strumento-card" key={strumento.id}>
      <div className="strumento-icon">
        {strumento.tipo === 'multimetro' ? '🔧' : '🔬'}
      </div>
      <div className="strumento-info">
        <h4>{strumento.nome || (strumento.tipo === 'multimetro' ? 'Multimetro' : 'Densimetro')}</h4>
        <p>{strumento.idStrumento} • Scad: {formatDate(strumento.scadenza)}</p>
      </div>
      <div className="strumento-actions">
        <button className="icon-btn edit" onClick={() => handleEdit(strumento)}>✏️</button>
        <button className="icon-btn delete" onClick={() => handleDelete(strumento.id)}>🗑️</button>
      </div>
    </div>
  );

  if (showForm) {
    return (
      <div className="modal-overlay show">
        <div className="modal-backdrop" onClick={handleCancel}></div>
        <div className="modal-content">
          <div className="modal-header">
            <h3>
              {editingStrumento ? '✏️ Modifica' : '➕ Aggiungi'} {formData.tipo === 'multimetro' ? 'Multimetro' : 'Densimetro'}
            </h3>
            <button className="modal-close" onClick={handleCancel}>✕</button>
          </div>

          <div className="modal-body">
            <div className="form-group">
              <label>Nome (opzionale)</label>
              <input
                type="text"
                placeholder="Es: Fluke 87V"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>ID Strumento *</label>
              <input
                type="text"
                placeholder="ID-xxxxxx"
                value={formData.idStrumento}
                onChange={(e) => setFormData(prev => ({ ...prev, idStrumento: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Data Scadenza *</label>
              <input
                type="date"
                value={formData.scadenza}
                onChange={(e) => setFormData(prev => ({ ...prev, scadenza: e.target.value }))}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleCancel}>
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

  return (
    <div className="modal-overlay show">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content strumenti-manager">
        <div className="modal-header">
          <h3>🛠️ Gestione Strumenti</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Caricamento...</p>
          ) : (
            <>
              {/* Multimetri */}
              <div className="strumenti-section">
                <h4 className="section-title">🔧 Multimetri salvati</h4>
                {multimetri.length === 0 ? (
                  <p className="empty-text">Nessun multimetro salvato</p>
                ) : (
                  multimetri.map(renderStrumentoCard)
                )}
                <button 
                  className="btn btn-outline btn-small"
                  onClick={() => handleAdd('multimetro')}
                >
                  ➕ Aggiungi Multimetro
                </button>
              </div>

              {/* Densimetri */}
              <div className="strumenti-section">
                <h4 className="section-title">🔬 Densimetri salvati</h4>
                {densimetri.length === 0 ? (
                  <p className="empty-text">Nessun densimetro salvato</p>
                ) : (
                  densimetri.map(renderStrumentoCard)
                )}
                <button 
                  className="btn btn-outline btn-small"
                  onClick={() => handleAdd('densimetro')}
                >
                  ➕ Aggiungi Densimetro
                </button>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

export default StrumentiManager;

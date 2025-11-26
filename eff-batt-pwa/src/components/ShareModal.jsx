import React, { useState, useEffect } from 'react';
import { getReports, markMultipleReportsAsShared } from '../utils/storage';
import { shareMultiplePDFs } from '../utils/pdfGenerator';
import { vibrateShort, vibrateSuccess } from '../utils/feedback';

function ShareModal({ show, state, pdfBytes, onClose, showToast }) {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show) {
      loadReports();
    }
  }, [show]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const allReports = await getReports();
      // Ordina per data decrescente
      allReports.sort((a, b) => b.createdAt - a.createdAt);
      setReports(allReports);
      setSelected([]);
    } catch (e) {
      console.error('Errore caricamento reports:', e);
    }
    setLoading(false);
  };

  const toggleSelect = (id) => {
    vibrateShort();
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    vibrateShort();
    if (selected.length === reports.length) {
      setSelected([]);
    } else {
      setSelected(reports.map(r => r.id));
    }
  };

  const handleShare = async () => {
    if (selected.length === 0) {
      showToast('Seleziona almeno un report', 'warning');
      return;
    }

    const toShare = reports.filter(r => selected.includes(r.id));
    const success = await shareMultiplePDFs(toShare);
    
    if (success) {
      // Marca i report come condivisi
      await markMultipleReportsAsShared(selected);
      vibrateSuccess();
      showToast(`✅ ${toShare.length} report condivisi!`, 'success');
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="share-modal show">
      <div className="share-modal-backdrop" onClick={onClose}></div>
      <div className="share-modal-content">
        <h3>📤 Report da condividere</h3>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Caricamento...</p>
        ) : reports.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <div>📄</div>
            <p>Nessun report generato</p>
          </div>
        ) : (
          <>
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '12px'
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                {reports.length} report disponibili
              </span>
              <button 
                onClick={selectAll}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--primary)',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {selected.length === reports.length ? 'Deseleziona tutti' : 'Seleziona tutti'}
              </button>
            </div>

            <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
              {reports.map(report => (
                <div 
                  key={report.id} 
                  className="share-item"
                  onClick={() => toggleSelect(report.id)}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(report.id)}
                    onChange={() => {}}
                  />
                  <div className="share-item-info">
                    <h4>{report.veicolo}</h4>
                    <p>{report.tipo} • {report.data} • {report.sede}</p>
                  </div>
                </div>
              ))}
            </div>

            <p style={{ 
              textAlign: 'center', 
              fontSize: '13px', 
              color: 'var(--primary)',
              fontWeight: '600',
              margin: '12px 0'
            }}>
              Selezionati: {selected.length} report
            </p>
          </>
        )}

        <div className="share-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Chiudi
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleShare}
            disabled={selected.length === 0}
          >
            📤 Condividi ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;

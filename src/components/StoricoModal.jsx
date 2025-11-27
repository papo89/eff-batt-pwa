import React, { useState, useEffect } from 'react';
import { getSharedReports, deleteReport } from '../utils/storage';
import { sharePDF } from '../utils/pdfGenerator';
import { vibrateShort, vibrateSuccess } from '../utils/feedback';

function StoricoModal({ onClose, showToast }) {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [searchQuery, reports]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const sharedReports = await getSharedReports();
      // Ordina per data decrescente
      sharedReports.sort((a, b) => b.createdAt - a.createdAt);
      setReports(sharedReports);
      setFilteredReports(sharedReports);
    } catch (e) {
      console.error('Errore caricamento storico:', e);
    }
    setLoading(false);
  };

  const filterReports = () => {
    if (!searchQuery.trim()) {
      setFilteredReports(reports);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = reports.filter(r => 
      r.filename.toLowerCase().includes(query)
    );
    setFilteredReports(filtered);
  };

  const handleDelete = async (id, filename) => {
    if (window.confirm(`Eliminare "${filename}"?`)) {
      vibrateShort();
      await deleteReport(id);
      loadReports();
      showToast('Report eliminato', 'success');
    }
  };

  const handleReShare = async (report) => {
    vibrateShort();
    const success = await sharePDF(report.pdfBlob, report.filename);
    if (success) {
      vibrateSuccess();
      showToast('Report condiviso', 'success');
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay show">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content storico-modal">
        <div className="modal-header">
          <h3>📚 Storico Report</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Barra di ricerca */}
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cerca per nome file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="search-clear"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Caricamento...</p>
          ) : filteredReports.length === 0 ? (
            <div className="empty-state">
              {searchQuery ? (
                <>
                  <div className="empty-icon">🔍</div>
                  <p>Nessun risultato per "{searchQuery}"</p>
                </>
              ) : (
                <>
                  <div className="empty-icon">📭</div>
                  <p>Nessun report nello storico</p>
                  <p className="empty-hint">I report appariranno qui dopo essere stati condivisi</p>
                </>
              )}
            </div>
          ) : (
            <div className="storico-list">
              {filteredReports.map((report) => (
                <div className="storico-item" key={report.id}>
                  <div className="storico-info">
                    <div className="storico-filename">{report.filename}</div>
                    <div className="storico-meta">
                      <span>{report.veicolo}</span>
                      <span>•</span>
                      <span>{report.tipo}</span>
                      <span>•</span>
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                    {report.sede && (
                      <div className="storico-sede">📍 {report.sede}</div>
                    )}
                  </div>
                  <div className="storico-actions">
                    <button 
                      className="icon-btn share"
                      onClick={() => handleReShare(report)}
                      title="Ricondividi"
                    >
                      📤
                    </button>
                    <button 
                      className="icon-btn delete"
                      onClick={() => handleDelete(report.id, report.filename)}
                      title="Elimina"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
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

export default StoricoModal;

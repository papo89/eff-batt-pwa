import React, { useState, useEffect } from 'react';
import { getReportStats } from '../utils/storage';

function Dashboard({ onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await getReportStats();
    setStats(data);
    setLoading(false);
  };

  return (
    <div className="modal-overlay show">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content dashboard">
        <div className="modal-header">
          <h3>📊 Dashboard</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Caricamento...</p>
          ) : stats ? (
            <>
              {/* Contatori report */}
              <h4 className="dashboard-section-title">Report Generati</h4>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.today}</div>
                  <div className="stat-label">Oggi</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.week}</div>
                  <div className="stat-label">Settimana</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.month}</div>
                  <div className="stat-label">Mese</div>
                </div>
              </div>

              {/* Totale */}
              <div className="stat-total">
                <span className="stat-total-label">Totale report:</span>
                <span className="stat-total-value">{stats.total}</span>
              </div>

              {/* Per tipo */}
              {stats.total > 0 && (
                <>
                  <h4 className="dashboard-section-title">Per tipo scadenza</h4>
                  
                  <div className="stat-bar-container">
                    <div className="stat-bar-header">
                      <span>3 Mesi</span>
                      <span>{stats.tipo3M} report</span>
                    </div>
                    <div className="stat-bar">
                      <div 
                        className="stat-bar-fill bar-3m"
                        style={{ width: `${stats.percentuale3M}%` }}
                      ></div>
                    </div>
                    <div className="stat-bar-percent">{stats.percentuale3M}%</div>
                  </div>

                  <div className="stat-bar-container">
                    <div className="stat-bar-header">
                      <span>6 Mesi</span>
                      <span>{stats.tipo6M} report</span>
                    </div>
                    <div className="stat-bar">
                      <div 
                        className="stat-bar-fill bar-6m"
                        style={{ width: `${stats.percentuale6M}%` }}
                      ></div>
                    </div>
                    <div className="stat-bar-percent">{stats.percentuale6M}%</div>
                  </div>
                </>
              )}

              {stats.total === 0 && (
                <div className="empty-state" style={{ padding: '30px' }}>
                  <div>📄</div>
                  <p>Nessun report generato</p>
                </div>
              )}
            </>
          ) : (
            <p>Errore caricamento statistiche</p>
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

export default Dashboard;

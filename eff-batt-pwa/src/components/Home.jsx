import React, { useEffect } from 'react';
import { isVehicleComplete, checkScadenzePreventive } from '../utils/validation';
import ScadenzeAlert from './ScadenzeAlert';
import StrumentiAutocomplete from './StrumentiAutocomplete';

function Home({ 
  state, 
  onUpdateOperatore, 
  onUpdateStrumenti,
  onAddSede,
  onEditSede,
  onDeleteSede,
  onAddVehicle,
  onEditVehicle,
  onDeleteVehicle,
  onOpenVehicle,
  showToast
}) {
  
  // Controllo scadenze preventive onBlur
  const handleScadenzaBlur = () => {
    const warnings = checkScadenzePreventive(state.strumenti, state.operatore);
    if (warnings.length > 0) {
      showToast(warnings.join('<br>'), 'warning');
    }
  };

  return (
    <div className="container">
      {/* Banner Scadenze Imminenti */}
      <ScadenzeAlert strumenti={state.strumenti} />

      {/* Dati Operatore */}
      <div className="card">
        <h2>👷 Dati Operatore</h2>
        <div className="form-group">
          <label>Nome Operatore</label>
          <input
            type="text"
            placeholder="Mario Rossi"
            value={state.operatore.nome}
            onChange={(e) => onUpdateOperatore('nome', e.target.value)}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>CID</label>
            <input
              type="text"
              placeholder="123456"
              value={state.operatore.cid}
              onChange={(e) => onUpdateOperatore('cid', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Data</label>
            <input
              type="date"
              value={state.operatore.data}
              onChange={(e) => onUpdateOperatore('data', e.target.value)}
              onBlur={handleScadenzaBlur}
            />
          </div>
        </div>
      </div>

      {/* Strumenti */}
      <div className="card">
        <h2>🛠️ Strumenti di Misura</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: '-8px 0 12px' }}>
          Validi per tutte le prove • Inizia a digitare per suggerimenti
        </p>
        
        <div className="section-title" style={{ marginTop: 0 }}>Multimetro</div>
        <div className="strumenti-row">
          <div className="form-group">
            <label>ID Strumento</label>
            <StrumentiAutocomplete
              tipo="multimetro"
              value={state.strumenti.multId}
              scadenza={state.strumenti.multScad}
              onChangeId={(value) => onUpdateStrumenti('multId', value)}
              onChangeScadenza={(value) => onUpdateStrumenti('multScad', value)}
              placeholder="ID-xxxxxx"
            />
          </div>
          <div className="form-group">
            <label>Data Scadenza</label>
            <input
              type="date"
              value={state.strumenti.multScad}
              onChange={(e) => onUpdateStrumenti('multScad', e.target.value)}
              onBlur={handleScadenzaBlur}
            />
          </div>
        </div>

        <div className="section-title">Densimetro (per prove 6 mesi)</div>
        <div className="strumenti-row">
          <div className="form-group">
            <label>ID Strumento</label>
            <StrumentiAutocomplete
              tipo="densimetro"
              value={state.strumenti.densId}
              scadenza={state.strumenti.densScad}
              onChangeId={(value) => onUpdateStrumenti('densId', value)}
              onChangeScadenza={(value) => onUpdateStrumenti('densScad', value)}
              placeholder="ID-xxxxxx"
            />
          </div>
          <div className="form-group">
            <label>Data Scadenza</label>
            <input
              type="date"
              value={state.strumenti.densScad}
              onChange={(e) => onUpdateStrumenti('densScad', e.target.value)}
              onBlur={handleScadenzaBlur}
            />
          </div>
        </div>
      </div>

      {/* Sedi Tecniche */}
      <h2 style={{ fontSize: '16px', color: 'var(--primary)', marginBottom: '12px' }}>
        🚃🚃🚃 Sedi Tecniche
      </h2>

      {state.sedi.length === 0 ? (
        <div className="card empty-state">
          <div>🚃</div>
          <p>Nessuna sede tecnica.<br/>Aggiungi una sede per iniziare.</p>
        </div>
      ) : (
        state.sedi.map((sede, sedeIdx) => {
          const completedCount = sede.veicoli.filter((_, vi) => 
            isVehicleComplete(state, sedeIdx, vi)
          ).length;

          return (
            <div className="sede-card" key={sedeIdx}>
              <div className="sede-header">
                <div className="info">
                  <h3>📍 {sede.nome || 'Sede'}</h3>
                  <p>
                    ODL: {sede.odl || '-'} • {sede.veicoli.length}/8 veicoli
                    {completedCount > 0 && ` (${completedCount} ✅)`}
                  </p>
                </div>
                <div className="sede-actions">
                  <button 
                    className="icon-btn add" 
                    onClick={(e) => { e.stopPropagation(); onAddVehicle(sedeIdx); }}
                    disabled={sede.veicoli.length >= 8}
                  >
                    ➕
                  </button>
                  <button 
                    className="icon-btn edit" 
                    onClick={(e) => { e.stopPropagation(); onEditSede(sedeIdx); }}
                  >
                    ✏️
                  </button>
                  <button 
                    className="icon-btn delete" 
                    onClick={(e) => { e.stopPropagation(); onDeleteSede(sedeIdx); }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="sede-vehicles">
                {sede.veicoli.length === 0 ? (
                  <div className="empty-state" style={{ padding: '20px' }}>
                    Nessun veicolo
                  </div>
                ) : (
                  sede.veicoli.map((vehicle, vehicleIdx) => {
                    const hasData = vehicle.data && Object.keys(vehicle.data).length > 0;
                    const complete = isVehicleComplete(state, sedeIdx, vehicleIdx);
                    const hasPdf = vehicle.pdfGenerated;

                    let statusClass = '';
                    let statusText = '';
                    
                    if (complete) {
                      statusClass = 'completed';
                      statusText = '✅';
                      if (hasPdf) statusText += ' 📄';
                    } else if (hasData) {
                      statusClass = 'in-progress';
                      statusText = '⏳';
                    }

                    return (
                      <div 
                        className={`vehicle-item ${statusClass}`} 
                        key={vehicleIdx}
                        onClick={() => onOpenVehicle(sedeIdx, vehicleIdx)}
                      >
                        <div className="vehicle-info">
                          <h4>{vehicle.numero || 'Veicolo'}</h4>
                          <p>
                            <span className={`badge badge-${vehicle.tipo.toLowerCase()}`}>
                              {vehicle.tipo === '3M' ? '3 Mesi' : '6 Mesi'}
                            </span>
                            {' '}{statusText}
                          </p>
                        </div>
                        <div className="vehicle-actions">
                          <button 
                            className="icon-btn edit"
                            onClick={(e) => { e.stopPropagation(); onEditVehicle(sedeIdx, vehicleIdx); }}
                          >
                            ✏️
                          </button>
                          <button 
                            className="icon-btn delete"
                            onClick={(e) => { e.stopPropagation(); onDeleteVehicle(sedeIdx, vehicleIdx); }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })
      )}

      <button className="btn btn-primary" onClick={onAddSede}>
        ➕ Aggiungi Sede Tecnica e ODL
      </button>
    </div>
  );
}

export default Home;

import React from 'react';
import { checkScadenzeImminenti, getScadenzaColor } from '../utils/validation';

function ScadenzeAlert({ strumenti }) {
  const warnings = checkScadenzeImminenti(strumenti, 20);
  
  if (warnings.length === 0) return null;

  return (
    <div className="scadenze-alert">
      <div className="scadenze-header">
        <span className="scadenze-icon">⚠️</span>
        <span className="scadenze-title">Strumenti in scadenza</span>
      </div>
      <div className="scadenze-list">
        {warnings.map((warning, idx) => (
          <div 
            key={idx} 
            className={`scadenza-item scadenza-${getScadenzaColor(warning.giorni)}`}
          >
            <div className="scadenza-strumento">
              {warning.strumento} {warning.id}
            </div>
            <div className="scadenza-info">
              {warning.giorni <= 0 
                ? `SCADUTO (${warning.scadenza})`
                : `Scade tra ${warning.giorni} giorni (${warning.scadenza})`
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScadenzeAlert;

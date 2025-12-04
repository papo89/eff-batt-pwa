import React, { useState, useEffect, useRef } from 'react';
import { 
  validateMisurazioni, 
  validateDensita, 
  validateScadenzeStrumenti,
  getMissingFields,
  formatDataProduzione,
  formatDate,
  validaDensitaPacco
} from '../utils/validation';
import { generatePDF, getFilename, getReportId } from '../utils/pdfGenerator';
import { saveReport, loadSettings } from '../utils/storage';
import { vibrateShort, vibrateSuccess, vibrateError } from '../utils/feedback';
import SuccessPopup from './SuccessPopup';

function VehicleForm({ state, sedeIdx, vehicleIdx, pdfBytes, onUpdateData, onPdfGenerated, onBack, onOpenShare, showToast }) {
  const sede = state.sedi[sedeIdx];
  const vehicle = sede.veicoli[vehicleIdx];
  const data = vehicle.data || {};
  const tipo = vehicle.tipo;
  const settings = loadSettings();

  // Determina gli step in base al tipo di verifica
  const getSteps = () => {
    if (tipo === '3M') {
      // Solo 3 Mesi: Batterie → Misurazioni → Esito
      return [
        { id: 'batterie', title: '🔋 Batterie' }, 
        { id: 'misure', title: '📊 Misurazioni' }, 
        { id: 'esito', title: '✅ Esito' }
      ];
    } else if (tipo === '6M') {
      // Solo 6 Mesi: Batterie → Densità → Esito (NO misurazioni)
      return [
        { id: 'batterie', title: '🔋 Batterie' }, 
        { id: 'densita', title: '💧 Densità' }, 
        { id: 'esito', title: '✅ Esito' }
      ];
    } else {
      // 3M + 6M: Batterie → Misurazioni → Densità → Esito
      return [
        { id: 'batterie', title: '🔋 Batterie' }, 
        { id: 'misure', title: '📊 Misurazioni' }, 
        { id: 'densita', title: '💧 Densità' }, 
        { id: 'esito', title: '✅ Esito' }
      ];
    }
  };

  const steps = getSteps();

  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const step = steps[currentStep];
  
  // Swipe refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const isHorizontalSwipe = useRef(false);

  // Wake Lock per schermo acceso
  useEffect(() => {
    let wakeLock = null;
    
    const requestWakeLock = async () => {
      if (settings.keepScreenOn && 'wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Wake Lock attivato');
        } catch (e) {
          console.log('Wake Lock non disponibile:', e);
        }
      }
    };
    
    requestWakeLock();
    
    return () => {
      if (wakeLock) {
        wakeLock.release();
        console.log('Wake Lock rilasciato');
      }
    };
  }, [settings.keepScreenOn]);

  const updateField = (field, value) => {
    onUpdateData({ [field]: value });
  };

  const handleDataProduzione = (field, value) => {
    const formattedValue = formatDataProduzione(value);
    updateField(field, formattedValue);
  };

  // Controllo scadenza batterie (6 anni) - chiamato onBlur
  const checkScadenzaBatterie = (field) => {
    const value = data[field];
    if (!value || value.length < 7) return; // Formato: MM/AAAA
    
    const dataOperatore = state.operatore.data;
    if (!dataOperatore) return;
    
    // Parse data produzione (MM/AAAA)
    const parts = value.split('/');
    if (parts.length !== 2) return;
    
    const meseProd = parseInt(parts[0], 10);
    const annoProd = parseInt(parts[1], 10);
    if (isNaN(meseProd) || isNaN(annoProd)) return;
    
    // Calcola data scadenza (+ 6 anni)
    const annoScadenza = annoProd + 6;
    const dataScadenza = new Date(annoScadenza, meseProd - 1, 1); // Primo giorno del mese
    
    // Parse data operatore (YYYY-MM-DD)
    const opParts = dataOperatore.split('-');
    const dataOp = new Date(parseInt(opParts[0], 10), parseInt(opParts[1], 10) - 1, parseInt(opParts[2], 10));
    
    // Calcola differenza in mesi
    const diffTime = dataScadenza.getTime() - dataOp.getTime();
    const diffMesi = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    // Determina quale pacco
    const paccoNum = field.includes('b1') ? '1' : '2';
    const scadenzaStr = `${String(meseProd).padStart(2, '0')}/${annoScadenza}`;
    
    if (diffMesi <= 0) {
      // Scaduto
      showToast(`⚠️ Pacco ${paccoNum}: SCADUTO (${scadenzaStr})`, 'danger');
    } else if (diffMesi <= 3) {
      // Scade entro 3 mesi
      showToast(`⚠️ Pacco ${paccoNum}: scade tra ${diffMesi} ${diffMesi === 1 ? 'mese' : 'mesi'} (${scadenzaStr})`, 'warning');
    }
  };

  // Riempi tutte le densità con il valore del primo elemento
  const fillDensita = (prefix) => {
    let firstValue = data[`${prefix}1`];
    if (!firstValue) return;
    
    // Formatta il valore se necessario (es: 120 → 1.20)
    if (!firstValue.includes('.') && !firstValue.includes(',')) {
      const numValue = parseInt(firstValue, 10);
      if (!isNaN(numValue) && numValue >= 101 && numValue <= 140) {
        firstValue = (numValue / 100).toFixed(2);
      }
    }
    
    vibrateShort();
    
    const updates = {};
    // Aggiorna tutti i 12 elementi, incluso il primo (per formattarlo)
    for (let i = 1; i <= 12; i++) {
      updates[`${prefix}${i}`] = firstValue;
    }
    onUpdateData(updates);
  };

  // Formatta automaticamente valore densità (es: 120 → 1.20)
  const formatDensitaValue = (field) => {
    const value = data[field];
    if (!value) return;
    
    // Se è già formattato con punto, non fare nulla
    if (value.includes('.') || value.includes(',')) return;
    
    // Se è un numero intero tra 101 e 140, converti in decimale
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 101 && numValue <= 140) {
      const formatted = (numValue / 100).toFixed(2);
      updateField(field, formatted);
    }
  };

  // Navigazione
  const canGoNext = () => {
    // Validazioni per step misure
    if (step.id === 'misure') {
      const warnings = validateMisurazioni(data);
      if (warnings.length > 0) {
        vibrateError();
        showToast(warnings.join('<br>'), 'danger');
        return false;
      }
    }

    // Validazioni per step densità
    if (step.id === 'densita') {
      // Validazione range 1.01-1.40
      const erroriPacco1 = validaDensitaPacco(data, 'p1e', 1);
      const erroriPacco2 = validaDensitaPacco(data, 'p2e', 2);
      const erroriRange = [...erroriPacco1, ...erroriPacco2];
      
      if (erroriRange.length > 0) {
        vibrateError();
        showToast(erroriRange.join('<br>'), 'danger');
        return false;
      }
      
      // Validazione differenza max-min
      const warnings = validateDensita(data);
      if (warnings.length > 0) {
        vibrateError();
        showToast(warnings.join('<br>'), 'danger');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (!canGoNext()) return;
    vibrateShort();
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    vibrateShort();
    setCurrentStep(prev => prev - 1);
  };

  // Swipe handlers - solo orizzontale, permette scroll verticale
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = false;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
    
    // Determina se è uno swipe orizzontale o verticale
    const diffX = Math.abs(touchEndX.current - touchStartX.current);
    const diffY = Math.abs(touchEndY.current - touchStartY.current);
    
    // Solo se il movimento orizzontale è maggiore di quello verticale
    if (diffX > diffY && diffX > 20) {
      isHorizontalSwipe.current = true;
    }
  };

  const handleTouchEnd = () => {
    // Solo se è uno swipe orizzontale significativo
    if (!isHorizontalSwipe.current) return;
    
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold && currentStep < steps.length - 1) {
      // Swipe left → prossimo step (con validazione)
      if (canGoNext()) {
        vibrateShort();
        setCurrentStep(prev => prev + 1);
      }
    } else if (diff < -threshold && currentStep > 0) {
      // Swipe right → step precedente
      vibrateShort();
      setCurrentStep(prev => prev - 1);
    } else if (diff < -threshold && currentStep === 0) {
      // Swipe right dalla prima slide → torna a Sedi
      vibrateShort();
      onBack();
    }
  };

  // Generazione PDF
  const handleGeneratePDF = async () => {
    // Controllo campi mancanti
    const missing = getMissingFields(state, sedeIdx, vehicleIdx);
    if (missing.length > 0) {
      vibrateError();
      showToast(`⚠️ Impossibile generare PDF.<br><br>Mancano:<br>• ${missing.join('<br>• ')}`, 'danger');
      return;
    }

    // Controllo scadenze
    const scadenze = validateScadenzeStrumenti(state.strumenti, state.operatore, tipo);
    if (scadenze.length > 0) {
      vibrateError();
      showToast(scadenze.join('<br>'), 'danger');
      return;
    }

    try {
      const pdfBytesOut = await generatePDF(pdfBytes, state, sedeIdx, vehicleIdx);
      const filename = getFilename(vehicle, state.operatore);
      const reportId = getReportId(vehicle, state.operatore);

      // Determina stringa tipo per storico
      let tipoStorico;
      if (tipo === '3M') tipoStorico = '3Mesi';
      else if (tipo === '6M') tipoStorico = '6Mesi';
      else tipoStorico = '3+6Mesi';

      // Salva report in IndexedDB
      await saveReport({
        id: reportId,
        veicolo: vehicle.numero,
        tipo: tipoStorico,
        data: formatDate(state.operatore.data),
        sede: sede.nome,
        odl: sede.odl,
        filename,
        pdfBlob: pdfBytesOut,
        createdAt: Date.now(),
        shared: false
      });

      onPdfGenerated();
      vibrateSuccess();
      
      // Mostra popup invece di condivisione automatica
      setShowSuccessPopup(true);
    } catch (e) {
      console.error('Errore generazione PDF:', e);
      vibrateError();
      showToast('Errore generazione PDF: ' + e.message, 'danger');
    }
  };

  // Handler popup success
  const handleGoToShare = () => {
    setShowSuccessPopup(false);
    onBack();
    if (onOpenShare) onOpenShare();
  };

  const handleGoHome = () => {
    setShowSuccessPopup(false);
    onBack();
  };

  // ==================== RENDER STEPS ====================
  const renderBatterie = () => (
    <>
      <div className="section-title">🔋 Pacco Batterie 1</div>
      <div className="form-row">
        <div className="form-group">
          <label>Data Produzione</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="MM/AAAA"
            maxLength={7}
            value={data.b1Data || ''}
            onChange={(e) => handleDataProduzione('b1Data', e.target.value)}
            onBlur={() => checkScadenzaBatterie('b1Data')}
          />
        </div>
        <div className="form-group">
          <label>Costruttore</label>
          <input
            type="text"
            value={data.b1Costr || ''}
            onChange={(e) => updateField('b1Costr', e.target.value.toUpperCase())}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>S/N 1</label>
          <input
            type="text"
            value={data.b1Sn1 || ''}
            onChange={(e) => updateField('b1Sn1', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>S/N 2</label>
          <input
            type="text"
            value={data.b1Sn2 || ''}
            onChange={(e) => updateField('b1Sn2', e.target.value)}
          />
        </div>
      </div>

      <div className="section-title">🔋 Pacco Batterie 2</div>
      <div className="form-row">
        <div className="form-group">
          <label>Data Produzione</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="MM/AAAA"
            maxLength={7}
            value={data.b2Data || ''}
            onChange={(e) => handleDataProduzione('b2Data', e.target.value)}
            onBlur={() => checkScadenzaBatterie('b2Data')}
          />
        </div>
        <div className="form-group">
          <label>Costruttore</label>
          <input
            type="text"
            value={data.b2Costr || ''}
            onChange={(e) => updateField('b2Costr', e.target.value.toUpperCase())}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>S/N 3</label>
          <input
            type="text"
            value={data.b2Sn3 || ''}
            onChange={(e) => updateField('b2Sn3', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>S/N 4</label>
          <input
            type="text"
            value={data.b2Sn4 || ''}
            onChange={(e) => updateField('b2Sn4', e.target.value)}
          />
        </div>
      </div>
    </>
  );

  const renderMisuraRow = (idLabel, prefix) => (
    <>
      <div className="section-title">{idLabel}</div>
      <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="form-group">
          <label>V Multi</label>
          <input
            type="text"
            inputMode="decimal"
            value={data[`${prefix}Vm`] || ''}
            onChange={(e) => updateField(`${prefix}Vm`, e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>V Vettura</label>
          <input
            type="text"
            inputMode="decimal"
            value={data[`${prefix}Vv`] || ''}
            onChange={(e) => updateField(`${prefix}Vv`, e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>I Vettura</label>
          <input
            type="text"
            inputMode="numeric"
            value={data[`${prefix}Iv`] || ''}
            onChange={(e) => updateField(`${prefix}Iv`, e.target.value)}
          />
        </div>
      </div>
    </>
  );

  const renderMisure = () => (
    <>
      {renderMisuraRow('ID.2 - Carica completa', 'id2')}
      {renderMisuraRow('ID.4 - Inizio scarica', 'id4')}
      {renderMisuraRow('ID.5 - Durante scarica', 'id5')}
      {renderMisuraRow('ID.6 - Fine scarica', 'id6')}
    </>
  );

  const renderDensitaGrid = (prefix, title) => (
    <>
      <div className="section-title">{title}</div>
      <div className="densita-grid">
        {[...Array(12)].map((_, i) => (
          <div className="form-group" key={i}>
            <label>{i + 1}</label>
            <input
              type="text"
              inputMode="decimal"
              value={data[`${prefix}${i + 1}`] || ''}
              onChange={(e) => updateField(`${prefix}${i + 1}`, e.target.value)}
              onBlur={() => formatDensitaValue(`${prefix}${i + 1}`)}
            />
          </div>
        ))}
      </div>
      <button
        className="btn btn-outline btn-small fill-btn"
        onClick={() => fillDensita(prefix)}
        disabled={!data[`${prefix}1`]}
      >
        📋 Riempi tutti con "{data[`${prefix}1`] || '----'}"
      </button>
    </>
  );

  const renderDensita = () => (
    <>
      {renderDensitaGrid('p1e', '💧 Densità Pacco 1 (1.01 - 1.40)')}
      {renderDensitaGrid('p2e', '💧 Densità Pacco 2 (1.01 - 1.40)')}
    </>
  );

  const renderEsito = () => (
    <>
      <div className="section-title">✅ Esito Verifica</div>
      <div className="esito-buttons">
        <button
          className={`esito-btn ${data.esito === 'POSITIVO' ? 'selected positivo' : ''}`}
          onClick={() => updateField('esito', 'POSITIVO')}
        >
          ✅ POSITIVO
        </button>
        <button
          className={`esito-btn ${data.esito === 'NEGATIVO' ? 'selected negativo' : ''}`}
          onClick={() => updateField('esito', 'NEGATIVO')}
        >
          ❌ NEGATIVO
        </button>
      </div>

      <div className="form-group" style={{ marginTop: '20px' }}>
        <label>Note (opzionale)</label>
        <textarea
          style={{ 
            width: '100%', 
            padding: '10px 12px', 
            border: '1px solid var(--border)', 
            borderRadius: '8px',
            fontSize: '14px',
            minHeight: '80px',
            resize: 'vertical'
          }}
          value={data.note || ''}
          onChange={(e) => updateField('note', e.target.value)}
          placeholder="Eventuali note..."
        />
      </div>
    </>
  );

  return (
    <div className="vehicle-form-swipe-container">
      <div className="vehicle-form-header">
        <span className="back-link" onClick={onBack}>← Indietro</span>
        
        <div className="vehicle-form-title">
          <h3>{vehicle.numero}</h3>
          <span className={`badge badge-${tipo.toLowerCase()}`}>
            {tipo === '3M' ? '3 Mesi' : tipo === '6M' ? '6 Mesi' : '3+6 Mesi'}
          </span>
        </div>

        {/* Steps indicator */}
        <div className="steps">
          {steps.map((s, i) => (
            <div 
              key={s.id} 
              className={`step ${i < currentStep ? 'completed' : ''} ${i === currentStep ? 'active' : ''}`}
              onClick={() => {
                if (i < currentStep) {
                  vibrateShort();
                  setCurrentStep(i);
                } else if (i === currentStep + 1 && canGoNext()) {
                  vibrateShort();
                  setCurrentStep(i);
                }
              }}
            />
          ))}
        </div>

        <h4 className="step-title">{step.title}</h4>
      </div>

      {/* Slides wrapper - touch events qui per permettere scroll verticale nelle slide */}
      <div 
        className="vehicle-slides-wrapper"
        style={{ transform: `translateX(-${currentStep * 100}vw)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {steps.map((s, idx) => (
          <div className="vehicle-slide" key={s.id}>
            <div className="vehicle-slide-content">
              {s.id === 'batterie' && renderBatterie()}
              {s.id === 'misure' && renderMisure()}
              {s.id === 'densita' && renderDensita()}
              {s.id === 'esito' && renderEsito()}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons - fixed at bottom */}
      <div className="vehicle-nav-buttons">
        <div className={`nav-buttons ${currentStep === 0 ? 'single' : ''}`}>
          {currentStep > 0 && (
            <button className="btn btn-secondary" onClick={prevStep}>
              ← Indietro
            </button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <button className="btn btn-primary" onClick={nextStep}>
              Avanti →
            </button>
          ) : (
            <button className="btn btn-success" onClick={handleGeneratePDF}>
              📄 Genera PDF
            </button>
          )}
        </div>
      </div>

      <SuccessPopup
        show={showSuccessPopup}
        onShare={handleGoToShare}
        onHome={handleGoHome}
      />
    </div>
  );
}

export default VehicleForm;

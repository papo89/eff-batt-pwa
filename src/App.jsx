import React, { useState, useEffect } from 'react';
import { loadState, saveState, getDefaultState, loadPdfTemplate, savePdfTemplate, loadSettings, saveSettings, getDefaultSettings } from './utils/storage';
import { initNotifications } from './utils/notifications';
import Header from './components/Header';
import Home from './components/Home';
import SedeForm from './components/SedeForm';
import VehicleModal from './components/VehicleModal';
import VehicleForm from './components/VehicleForm';
import PdfSetup from './components/PdfSetup';
import Toast from './components/Toast';
import ShareModal from './components/ShareModal';
import HamburgerMenu from './components/HamburgerMenu';
import PWAPrompt from './components/PWAPrompt';

function App() {
  const [state, setState] = useState(getDefaultState());
  const [settings, setSettings] = useState(getDefaultSettings());
  const [pdfBytes, setPdfBytes] = useState(null);
  const [screen, setScreen] = useState('loading');
  const [editingSede, setEditingSede] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [currentSede, setCurrentSede] = useState(null);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'warning' });
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Carica stato, settings e PDF all'avvio
  useEffect(() => {
    const init = async () => {
      const savedState = loadState();
      setState(savedState);
      
      const savedSettings = loadSettings();
      setSettings(savedSettings);
      
      const template = await loadPdfTemplate();
      if (template) {
        setPdfBytes(template);
        setScreen('home');
      } else {
        setScreen('setup');
      }

      // Inizializza notifiche
      initNotifications();
    };
    init();
  }, []);

  // Salva stato ad ogni modifica
  useEffect(() => {
    if (screen !== 'loading') {
      saveState(state);
    }
  }, [state, screen]);

  // Salva settings ad ogni modifica
  useEffect(() => {
    saveSettings(settings);
    applyTheme(settings.theme);
    applyTextSize(settings.textSize);
    applyBoldText(settings.boldText);
  }, [settings]);

  // Applica tema
  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    } else {
      root.classList.add(`theme-${theme}`);
    }
  };

  // Applica dimensione testo
  const applyTextSize = (size) => {
    const root = document.documentElement;
    root.classList.remove('text-small', 'text-normal', 'text-large');
    root.classList.add(`text-${size}`);
  };

  // Applica grassetto
  const applyBoldText = (bold) => {
    const root = document.documentElement;
    if (bold) {
      root.classList.add('text-bold');
    } else {
      root.classList.remove('text-bold');
    }
  };

  // ==================== STATE HANDLERS ====================
  const updateOperatore = (field, value) => {
    setState(prev => ({
      ...prev,
      operatore: { ...prev.operatore, [field]: value }
    }));
  };

  const updateStrumenti = (field, value) => {
    setState(prev => ({
      ...prev,
      strumenti: { ...prev.strumenti, [field]: value }
    }));
  };

  // ==================== SEDE HANDLERS ====================
  const addSede = (sede) => {
    setState(prev => ({
      ...prev,
      sedi: [...prev.sedi, { ...sede, veicoli: [] }]
    }));
    setScreen('home');
  };

  const updateSede = (index, sede) => {
    setState(prev => {
      const newSedi = [...prev.sedi];
      newSedi[index] = { ...newSedi[index], ...sede };
      return { ...prev, sedi: newSedi };
    });
    setEditingSede(null);
    setScreen('home');
  };

  const deleteSede = (index) => {
    if (window.confirm('Eliminare questa sede e tutti i suoi veicoli?')) {
      setState(prev => ({
        ...prev,
        sedi: prev.sedi.filter((_, i) => i !== index)
      }));
    }
  };

  // ==================== VEHICLE HANDLERS ====================
  const addVehicle = (sedeIdx, vehicle) => {
    setState(prev => {
      const newSedi = [...prev.sedi];
      newSedi[sedeIdx].veicoli.push({ ...vehicle, data: {}, pdfGenerated: false });
      return { ...prev, sedi: newSedi };
    });
    setEditingVehicle(null);
  };

  const updateVehicle = (sedeIdx, vehicleIdx, vehicle) => {
    setState(prev => {
      const newSedi = [...prev.sedi];
      newSedi[sedeIdx].veicoli[vehicleIdx] = {
        ...newSedi[sedeIdx].veicoli[vehicleIdx],
        ...vehicle
      };
      return { ...prev, sedi: newSedi };
    });
    setEditingVehicle(null);
  };

  const deleteVehicle = (sedeIdx, vehicleIdx) => {
    if (window.confirm('Eliminare questo veicolo?')) {
      setState(prev => {
        const newSedi = [...prev.sedi];
        newSedi[sedeIdx].veicoli = newSedi[sedeIdx].veicoli.filter((_, i) => i !== vehicleIdx);
        return { ...prev, sedi: newSedi };
      });
    }
  };

  const updateVehicleData = (sedeIdx, vehicleIdx, data) => {
    setState(prev => {
      const newSedi = [...prev.sedi];
      newSedi[sedeIdx].veicoli[vehicleIdx].data = {
        ...newSedi[sedeIdx].veicoli[vehicleIdx].data,
        ...data
      };
      return { ...prev, sedi: newSedi };
    });
  };

  const markVehiclePdfGenerated = (sedeIdx, vehicleIdx) => {
    setState(prev => {
      const newSedi = [...prev.sedi];
      newSedi[sedeIdx].veicoli[vehicleIdx].pdfGenerated = true;
      return { ...prev, sedi: newSedi };
    });
  };

  // ==================== PDF HANDLERS ====================
  const handlePdfUpload = async (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const bytes = new Uint8Array(reader.result);
        await savePdfTemplate(bytes);
        setPdfBytes(bytes);
        setScreen('home');
        showToast('PDF template caricato!', 'success');
      } catch (e) {
        showToast('PDF non valido: ' + e.message, 'danger');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ==================== TOAST ====================
  const showToast = (message, type = 'warning') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'warning' });
  };

  // ==================== NAVIGATION ====================
  const openSedeForm = (idx = null) => {
    setEditingSede(idx);
    setScreen('sede');
  };

  const openVehicleModal = (sedeIdx, vehicleIdx = null) => {
    setCurrentSede(sedeIdx);
    setEditingVehicle(vehicleIdx !== null ? { sedeIdx, vehicleIdx } : { sedeIdx, vehicleIdx: null });
  };

  const openVehicleForm = (sedeIdx, vehicleIdx) => {
    setCurrentSede(sedeIdx);
    setCurrentVehicle(vehicleIdx);
    setScreen('vehicle');
  };

  // ==================== RENDER ====================
  if (screen === 'loading') {
    return <div className="container"><div className="card"><p>Caricamento...</p></div></div>;
  }

  if (screen === 'setup') {
    return <PdfSetup onUpload={handlePdfUpload} />;
  }

  return (
    <>
      <Header 
        onShare={() => setShowShareModal(true)} 
        onMenuToggle={() => setShowMenu(true)}
      />
      
      {screen === 'home' && (
        <Home
          state={state}
          onUpdateOperatore={updateOperatore}
          onUpdateStrumenti={updateStrumenti}
          onAddSede={() => openSedeForm()}
          onEditSede={(idx) => openSedeForm(idx)}
          onDeleteSede={deleteSede}
          onAddVehicle={(sedeIdx) => openVehicleModal(sedeIdx)}
          onEditVehicle={(sedeIdx, vehicleIdx) => openVehicleModal(sedeIdx, vehicleIdx)}
          onDeleteVehicle={deleteVehicle}
          onOpenVehicle={openVehicleForm}
          showToast={showToast}
        />
      )}

      {screen === 'sede' && (
        <SedeForm
          sede={editingSede !== null ? state.sedi[editingSede] : null}
          onSave={(sede) => editingSede !== null ? updateSede(editingSede, sede) : addSede(sede)}
          onCancel={() => { setEditingSede(null); setScreen('home'); }}
        />
      )}

      {screen === 'vehicle' && currentSede !== null && currentVehicle !== null && (
        <VehicleForm
          state={state}
          sedeIdx={currentSede}
          vehicleIdx={currentVehicle}
          pdfBytes={pdfBytes}
          onUpdateData={(data) => updateVehicleData(currentSede, currentVehicle, data)}
          onPdfGenerated={() => markVehiclePdfGenerated(currentSede, currentVehicle)}
          onBack={() => { setCurrentSede(null); setCurrentVehicle(null); setScreen('home'); }}
          showToast={showToast}
        />
      )}

      {editingVehicle && (
        <VehicleModal
          vehicle={editingVehicle.vehicleIdx !== null 
            ? state.sedi[editingVehicle.sedeIdx].veicoli[editingVehicle.vehicleIdx] 
            : null}
          sedeVeicoliCount={state.sedi[editingVehicle.sedeIdx].veicoli.length}
          onSave={(vehicle) => {
            if (editingVehicle.vehicleIdx !== null) {
              updateVehicle(editingVehicle.sedeIdx, editingVehicle.vehicleIdx, vehicle);
            } else {
              addVehicle(editingVehicle.sedeIdx, vehicle);
            }
          }}
          onCancel={() => setEditingVehicle(null)}
        />
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      <ShareModal
        show={showShareModal}
        state={state}
        pdfBytes={pdfBytes}
        onClose={() => setShowShareModal(false)}
        showToast={showToast}
      />

      <HamburgerMenu
        show={showMenu}
        onClose={() => setShowMenu(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        showToast={showToast}
      />

      <PWAPrompt />
    </>
  );
}

export default App;

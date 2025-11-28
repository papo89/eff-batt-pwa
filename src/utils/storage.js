import { openDB } from 'idb';

const DB_NAME = 'EffBattDB';
const DB_VERSION = 2;
const STORE_PDF_TEMPLATE = 'pdfTemplate';
const STORE_REPORTS = 'reports';
const STORE_STRUMENTI = 'strumenti';
const STATE_KEY = 'effBattState';
const SETTINGS_KEY = 'effBattSettings';

// Inizializza IndexedDB
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains(STORE_PDF_TEMPLATE)) {
        db.createObjectStore(STORE_PDF_TEMPLATE);
      }
      if (!db.objectStoreNames.contains(STORE_REPORTS)) {
        db.createObjectStore(STORE_REPORTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_STRUMENTI)) {
        db.createObjectStore(STORE_STRUMENTI, { keyPath: 'id', autoIncrement: true });
      }
    }
  });
}

// ==================== STATE (localStorage) ====================
export function loadState() {
  try {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Errore caricamento state:', e);
  }
  return getDefaultState();
}

export function saveState(state) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify({
      operatore: state.operatore,
      strumenti: state.strumenti,
      sedi: state.sedi
    }));
  } catch (e) {
    console.error('Errore salvataggio state:', e);
  }
}

export function getDefaultState() {
  return {
    operatore: { nome: '', cid: '', data: '' },
    strumenti: { multId: '', multScad: '', densId: '', densScad: '' },
    sedi: []
  };
}

// ==================== PDF TEMPLATE (IndexedDB) ====================
export async function savePdfTemplate(pdfBytes) {
  const db = await initDB();
  await db.put(STORE_PDF_TEMPLATE, pdfBytes, 'template');
}

export async function loadPdfTemplate() {
  try {
    const db = await initDB();
    return await db.get(STORE_PDF_TEMPLATE, 'template');
  } catch (e) {
    console.error('Errore caricamento PDF template:', e);
    return null;
  }
}

export async function deletePdfTemplate() {
  const db = await initDB();
  await db.delete(STORE_PDF_TEMPLATE, 'template');
}

// ==================== REPORTS (IndexedDB) ====================
export async function saveReport(report) {
  const db = await initDB();
  await db.put(STORE_REPORTS, report);
}

export async function getReports() {
  try {
    const db = await initDB();
    return await db.getAll(STORE_REPORTS);
  } catch (e) {
    console.error('Errore caricamento reports:', e);
    return [];
  }
}

export async function getReport(id) {
  const db = await initDB();
  return await db.get(STORE_REPORTS, id);
}

export async function deleteReport(id) {
  const db = await initDB();
  await db.delete(STORE_REPORTS, id);
}

export async function deleteAllReports() {
  const db = await initDB();
  await db.clear(STORE_REPORTS);
}

// ==================== SETTINGS (localStorage) ====================
export function getDefaultSettings() {
  return {
    theme: 'auto',           // 'light', 'dark', 'auto'
    textSize: 'normal',      // 'small', 'normal', 'large'
    boldText: false,
    vibrationEnabled: true,
    keepScreenOn: false,
    notificationsEnabled: true,
    notificationTimeWorkday: { hour: 15, minute: 15 },
    notificationTimeHoliday: { hour: 12, minute: 50 }
  };
}

export function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...getDefaultSettings(), ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Errore caricamento settings:', e);
  }
  return getDefaultSettings();
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Errore salvataggio settings:', e);
  }
}

// ==================== TEMPLATE STRUMENTI (IndexedDB) ====================
export async function saveStrumento(strumento) {
  const db = await initDB();
  const id = await db.put(STORE_STRUMENTI, strumento);
  return id;
}

export async function getStrumenti() {
  try {
    const db = await initDB();
    return await db.getAll(STORE_STRUMENTI);
  } catch (e) {
    console.error('Errore caricamento strumenti:', e);
    return [];
  }
}

export async function getStrumentiByType(tipo) {
  const strumenti = await getStrumenti();
  return strumenti.filter(s => s.tipo === tipo);
}

export async function updateStrumento(id, updates) {
  const db = await initDB();
  const strumento = await db.get(STORE_STRUMENTI, id);
  if (strumento) {
    const updated = { ...strumento, ...updates };
    await db.put(STORE_STRUMENTI, updated);
    return updated;
  }
  return null;
}

export async function deleteStrumento(id) {
  const db = await initDB();
  await db.delete(STORE_STRUMENTI, id);
}

// ==================== STATISTICHE REPORTS ====================
export async function getReportStats() {
  const reports = await getReports();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  let todayCount = 0;
  let weekCount = 0;
  let monthCount = 0;
  let tipo3M = 0;
  let tipo6M = 0;

  reports.forEach(r => {
    const createdAt = new Date(r.createdAt);
    
    if (createdAt >= today) todayCount++;
    if (createdAt >= weekAgo) weekCount++;
    if (createdAt >= monthAgo) monthCount++;
    
    if (r.tipo === '3Mesi') tipo3M++;
    else if (r.tipo === '6Mesi') tipo6M++;
  });

  const total = reports.length;
  
  return {
    today: todayCount,
    week: weekCount,
    month: monthCount,
    total,
    tipo3M,
    tipo6M,
    percentuale3M: total > 0 ? Math.round((tipo3M / total) * 100) : 0,
    percentuale6M: total > 0 ? Math.round((tipo6M / total) * 100) : 0
  };
}

export async function getUnsharedReportsCount() {
  const reports = await getReports();
  return reports.filter(r => !r.shared).length;
}

export async function getUnsharedReports() {
  const reports = await getReports();
  return reports.filter(r => !r.shared);
}

export async function getSharedReports() {
  const reports = await getReports();
  return reports.filter(r => r.shared === true);
}

export async function getSharedReportsCount() {
  const reports = await getReports();
  return reports.filter(r => r.shared === true).length;
}

export async function markReportAsShared(id) {
  const db = await initDB();
  const report = await db.get(STORE_REPORTS, id);
  if (report) {
    report.shared = true;
    await db.put(STORE_REPORTS, report);
  }
}

export async function markMultipleReportsAsShared(ids) {
  const db = await initDB();
  for (const id of ids) {
    const report = await db.get(STORE_REPORTS, id);
    if (report) {
      report.shared = true;
      await db.put(STORE_REPORTS, report);
    }
  }
}

import { openDB } from 'idb';

const DB_NAME = 'EffBattDB';
const DB_VERSION = 1;
const STORE_PDF_TEMPLATE = 'pdfTemplate';
const STORE_REPORTS = 'reports';
const STATE_KEY = 'effBattState';

// Inizializza IndexedDB
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_PDF_TEMPLATE)) {
        db.createObjectStore(STORE_PDF_TEMPLATE);
      }
      if (!db.objectStoreNames.contains(STORE_REPORTS)) {
        db.createObjectStore(STORE_REPORTS, { keyPath: 'id' });
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

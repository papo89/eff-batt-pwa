// Vibrazione feedback con check impostazioni
import { loadSettings } from './storage';

const patterns = {
  short: 50,              // Click/conferma
  success: [50, 50, 50],  // PDF generato
  error: [100, 50, 100],  // Errore
  warning: [50, 100, 50]  // Avviso
};

export function vibrate(pattern = 'short') {
  // Check se vibrazione abilitata nelle impostazioni
  const settings = loadSettings();
  if (!settings.vibrationEnabled) return;
  
  // Check se browser supporta vibrazione
  if (!navigator.vibrate) return;
  
  const vibrationPattern = patterns[pattern] || patterns.short;
  navigator.vibrate(vibrationPattern);
}

export function vibrateShort() {
  vibrate('short');
}

export function vibrateSuccess() {
  vibrate('success');
}

export function vibrateError() {
  vibrate('error');
}

export function vibrateWarning() {
  vibrate('warning');
}

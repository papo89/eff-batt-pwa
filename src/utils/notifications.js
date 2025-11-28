// Gestione notifiche programmate
import { getNotificationTime as getHolidayNotificationTime, isWeekendOrHoliday } from './holidays';
import { getUnsharedReportsCount, loadSettings } from './storage';

let notificationTimeout = null;

/**
 * Richiede permesso per le notifiche
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Browser non supporta notifiche');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

/**
 * Mostra una notifica
 */
export function showNotification(title, options = {}) {
  if (Notification.permission !== 'granted') {
    return;
  }
  
  const defaultOptions = {
    icon: '/eff-batt-pwa/icons/icon-192.png',
    badge: '/eff-batt-pwa/icons/icon-192.png',
    vibrate: [100, 50, 100],
    requireInteraction: false,
    ...options
  };
  
  try {
    const notification = new Notification(title, defaultOptions);
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    return notification;
  } catch (e) {
    console.error('Errore creazione notifica:', e);
  }
}

/**
 * Mostra notifica per report non inviati
 */
export async function showUnsharedReportsNotification() {
  const count = await getUnsharedReportsCount();
  
  if (count > 0) {
    showNotification('📄 EFF BATT - Report da inviare', {
      body: `Hai ${count} report non ancora condivisi.`,
      tag: 'unshared-reports',
      renotify: true
    });
  }
}

/**
 * Ottiene l'orario di notifica per una data (da settings utente)
 */
export function getNotificationTime(date) {
  const settings = loadSettings();
  
  if (isWeekendOrHoliday(date)) {
    return settings.notificationTimeHoliday || { hour: 12, minute: 50 };
  }
  return settings.notificationTimeWorkday || { hour: 15, minute: 15 };
}

/**
 * Calcola il prossimo orario di notifica
 */
export function getNextNotificationTime() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Orario di oggi
  const todayTime = getNotificationTime(today);
  const todayNotification = new Date(today);
  todayNotification.setHours(todayTime.hour, todayTime.minute, 0, 0);
  
  // Se l'orario di oggi non è ancora passato, usa quello
  if (now < todayNotification) {
    return todayNotification;
  }
  
  // Altrimenti calcola per domani
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTime = getNotificationTime(tomorrow);
  const tomorrowNotification = new Date(tomorrow);
  tomorrowNotification.setHours(tomorrowTime.hour, tomorrowTime.minute, 0, 0);
  
  return tomorrowNotification;
}

/**
 * Schedula la prossima notifica
 */
export function scheduleNextNotification() {
  // Cancella timeout esistente
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  
  const settings = loadSettings();
  if (!settings.notificationsEnabled) {
    console.log('Notifiche disabilitate nelle impostazioni');
    return;
  }
  
  const nextTime = getNextNotificationTime();
  const now = new Date();
  const delay = nextTime.getTime() - now.getTime();
  
  console.log(`Prossima notifica schedulata per: ${nextTime.toLocaleString('it-IT')}`);
  
  notificationTimeout = setTimeout(async () => {
    await showUnsharedReportsNotification();
    // Schedula la prossima
    scheduleNextNotification();
  }, delay);
}

/**
 * Inizializza il sistema di notifiche
 */
export async function initNotifications() {
  const settings = loadSettings();
  
  if (!settings.notificationsEnabled) {
    console.log('Notifiche disabilitate nelle impostazioni');
    return;
  }
  
  const hasPermission = await requestNotificationPermission();
  
  if (hasPermission) {
    scheduleNextNotification();
    console.log('Sistema notifiche inizializzato');
  } else {
    console.log('Permesso notifiche non concesso');
  }
}

/**
 * Ferma il sistema di notifiche
 */
export function stopNotifications() {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
    console.log('Sistema notifiche fermato');
  }
}

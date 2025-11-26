// Calendario festivi italiani 2025-2045

// Date Pasqua pre-calcolate (algoritmo di Gauss)
const EASTER_DATES = {
  2025: { month: 3, day: 20 },  // 20 Aprile
  2026: { month: 3, day: 5 },   // 5 Aprile
  2027: { month: 2, day: 28 },  // 28 Marzo
  2028: { month: 3, day: 16 },  // 16 Aprile
  2029: { month: 3, day: 1 },   // 1 Aprile
  2030: { month: 3, day: 21 },  // 21 Aprile
  2031: { month: 3, day: 13 },  // 13 Aprile
  2032: { month: 2, day: 28 },  // 28 Marzo
  2033: { month: 3, day: 17 },  // 17 Aprile
  2034: { month: 3, day: 9 },   // 9 Aprile
  2035: { month: 2, day: 25 },  // 25 Marzo
  2036: { month: 3, day: 13 },  // 13 Aprile
  2037: { month: 3, day: 5 },   // 5 Aprile
  2038: { month: 3, day: 25 },  // 25 Aprile
  2039: { month: 3, day: 10 },  // 10 Aprile
  2040: { month: 3, day: 1 },   // 1 Aprile
  2041: { month: 3, day: 21 },  // 21 Aprile
  2042: { month: 3, day: 6 },   // 6 Aprile
  2043: { month: 2, day: 29 },  // 29 Marzo
  2044: { month: 3, day: 17 },  // 17 Aprile
  2045: { month: 3, day: 9 }    // 9 Aprile
};

// Festivi fissi (mese 0-based)
const FIXED_HOLIDAYS = [
  { month: 0, day: 1, name: 'Capodanno' },
  { month: 0, day: 6, name: 'Epifania' },
  { month: 3, day: 25, name: 'Festa della Liberazione' },
  { month: 4, day: 1, name: 'Festa del Lavoro' },
  { month: 5, day: 2, name: 'Festa della Repubblica' },
  { month: 7, day: 15, name: 'Ferragosto' },
  { month: 9, day: 4, name: 'San Francesco' },
  { month: 10, day: 1, name: 'Ognissanti' },
  { month: 11, day: 8, name: 'Immacolata Concezione' },
  { month: 11, day: 25, name: 'Natale' },
  { month: 11, day: 26, name: 'Santo Stefano' }
];

/**
 * Ottiene la data di Pasqua per un anno
 */
export function getEasterDate(year) {
  if (EASTER_DATES[year]) {
    return new Date(year, EASTER_DATES[year].month, EASTER_DATES[year].day);
  }
  // Fallback: calcolo algoritmico per anni fuori range
  return calculateEaster(year);
}

/**
 * Calcolo Pasqua con algoritmo di Gauss (fallback)
 */
function calculateEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

/**
 * Ottiene la data di Pasquetta (lunedì dopo Pasqua)
 */
export function getEasterMondayDate(year) {
  const easter = getEasterDate(year);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  return easterMonday;
}

/**
 * Ottiene tutti i festivi per un anno
 */
export function getHolidaysForYear(year) {
  const holidays = [];
  
  // Festivi fissi
  FIXED_HOLIDAYS.forEach(h => {
    holidays.push({
      date: new Date(year, h.month, h.day),
      name: h.name
    });
  });
  
  // Pasqua e Pasquetta
  holidays.push({
    date: getEasterDate(year),
    name: 'Pasqua'
  });
  
  holidays.push({
    date: getEasterMondayDate(year),
    name: 'Pasquetta'
  });
  
  return holidays;
}

/**
 * Verifica se una data è un festivo italiano
 */
export function isHoliday(date) {
  const year = date.getFullYear();
  
  // Check range supportato
  if (year < 2025 || year > 2045) {
    console.warn('Anno fuori dal range supportato (2025-2045)');
  }
  
  const holidays = getHolidaysForYear(year);
  
  return holidays.some(h => 
    h.date.getDate() === date.getDate() &&
    h.date.getMonth() === date.getMonth() &&
    h.date.getFullYear() === date.getFullYear()
  );
}

/**
 * Verifica se una data è un giorno feriale (lun-ven, no festivi)
 */
export function isWorkday(date) {
  const dayOfWeek = date.getDay();
  // 0 = domenica, 6 = sabato
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }
  return !isHoliday(date);
}

/**
 * Verifica se una data è weekend o festivo
 */
export function isWeekendOrHoliday(date) {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6 || isHoliday(date);
}

/**
 * Ottiene l'orario di notifica per una data
 * - Lun-Ven (no festivi): 15:15
 * - Sab-Dom + festivi: 12:50
 */
export function getNotificationTime(date) {
  if (isWeekendOrHoliday(date)) {
    return { hour: 12, minute: 50 };
  }
  return { hour: 15, minute: 15 };
}

/**
 * Ottiene il nome del festivo se la data è festiva
 */
export function getHolidayName(date) {
  const year = date.getFullYear();
  const holidays = getHolidaysForYear(year);
  
  const holiday = holidays.find(h => 
    h.date.getDate() === date.getDate() &&
    h.date.getMonth() === date.getMonth()
  );
  
  return holiday ? holiday.name : null;
}

// ==================== VALIDAZIONE CAMPI OBBLIGATORI ====================
export function getMissingFields(state, sedeIdx, vehicleIdx) {
  const sede = state.sedi[sedeIdx];
  const vehicle = sede.veicoli[vehicleIdx];
  const d = vehicle.data || {};
  const str = state.strumenti;
  const op = state.operatore;
  const missing = [];

  // Campi SEMPRE obbligatori
  if (!op.nome) missing.push('Nome Operatore');
  if (!op.cid) missing.push('CID');
  if (!op.data) missing.push('Data');
  if (!sede.nome) missing.push('Sede Tecnica');
  if (!sede.odl) missing.push('ODL');
  if (!vehicle.numero) missing.push('Numero Veicolo');
  if (!str.multId) missing.push('ID Multimetro');
  if (!str.multScad) missing.push('Scadenza Multimetro');

  // Batterie Pacco 1
  if (!d.b1Data) missing.push('Data Produzione Pacco 1');
  if (!d.b1Costr) missing.push('Costruttore Pacco 1');
  if (!d.b1Sn1) missing.push('S/N 1');
  if (!d.b1Sn2) missing.push('S/N 2');

  // Batterie Pacco 2
  if (!d.b2Data) missing.push('Data Produzione Pacco 2');
  if (!d.b2Costr) missing.push('Costruttore Pacco 2');
  if (!d.b2Sn3) missing.push('S/N 3');
  if (!d.b2Sn4) missing.push('S/N 4');

  // Misurazioni ID.2
  if (!d.id2Vm) missing.push('ID.2 V Multi');
  if (!d.id2Vv) missing.push('ID.2 V Vettura');
  if (!d.id2Iv) missing.push('ID.2 I Vettura');

  // Misurazioni ID.4
  if (!d.id4Vm) missing.push('ID.4 V Multi');
  if (!d.id4Vv) missing.push('ID.4 V Vettura');
  if (!d.id4Iv) missing.push('ID.4 I Vettura');

  // Misurazioni ID.5
  if (!d.id5Vm) missing.push('ID.5 V Multi');
  if (!d.id5Vv) missing.push('ID.5 V Vettura');
  if (!d.id5Iv) missing.push('ID.5 I Vettura');

  // Misurazioni ID.6
  if (!d.id6Vm) missing.push('ID.6 V Multi');
  if (!d.id6Vv) missing.push('ID.6 V Vettura');
  if (!d.id6Iv) missing.push('ID.6 I Vettura');

  // Esito
  if (!d.esito) missing.push('Esito');

  // Campi aggiuntivi per 6 Mesi
  if (vehicle.tipo === '6M') {
    if (!str.densId) missing.push('ID Densimetro');
    if (!str.densScad) missing.push('Scadenza Densimetro');

    // Densità Pacco 1
    for (let i = 1; i <= 12; i++) {
      if (!d[`p1e${i}`]) missing.push(`Densità Pacco 1 Elemento ${i}`);
    }

    // Densità Pacco 2
    for (let i = 1; i <= 12; i++) {
      if (!d[`p2e${i}`]) missing.push(`Densità Pacco 2 Elemento ${i}`);
    }
  }

  return missing;
}

export function isVehicleComplete(state, sedeIdx, vehicleIdx) {
  return getMissingFields(state, sedeIdx, vehicleIdx).length === 0;
}

// ==================== VALIDAZIONE MISURAZIONI ====================
export function validateMisurazioni(data) {
  const warnings = [];

  // Controllo V Multi ID.6 < 20
  const vMultiId6 = parseFloat(data.id6Vm);
  if (!isNaN(vMultiId6) && vMultiId6 < 20) {
    warnings.push('⚠️ V finale < 20V fuori range');
  }

  // Controllo I Vettura ID.6 < 50% di I Vettura ID.4
  const iVetturaId4 = parseFloat(data.id4Iv);
  const iVetturaId6 = parseFloat(data.id6Iv);
  if (!isNaN(iVetturaId4) && !isNaN(iVetturaId6) && iVetturaId4 > 0) {
    if (iVetturaId6 < (iVetturaId4 * 0.5)) {
      warnings.push('⚠️ I Vettura Finale < 50% I Vettura iniziale');
    }
  }

  return warnings;
}

// ==================== VALIDAZIONE DENSITÀ ====================
export function validateDensita(data) {
  const warnings = [];

  function checkDensitaDiff(prefix, paccoName) {
    const values = [];
    for (let i = 1; i <= 12; i++) {
      const val = parseFloat(data[`${prefix}${i}`]);
      if (!isNaN(val)) {
        values.push(val);
      }
    }
    if (values.length > 1) {
      const max = Math.max(...values);
      const min = Math.min(...values);
      if ((max - min) > 30) {
        warnings.push(`⚠️ Differenza densità ${paccoName} > 30g/l`);
      }
    }
  }

  checkDensitaDiff('p1e', 'Pacco 1');
  checkDensitaDiff('p2e', 'Pacco 2');

  return warnings;
}

// ==================== VALIDAZIONE SCADENZE STRUMENTI ====================
export function validateScadenzeStrumenti(strumenti, operatore, tipo) {
  const warnings = [];

  // Controllo scadenza Multimetro
  if (strumenti.multScad && operatore.data) {
    if (strumenti.multScad < operatore.data) {
      warnings.push(`⚠️ Multimetro scaduto (scadenza: ${formatDate(strumenti.multScad)})`);
    }
  }

  // Controllo scadenza Densimetro (solo per 6 Mesi)
  if (tipo === '6M' && strumenti.densScad && operatore.data) {
    if (strumenti.densScad < operatore.data) {
      warnings.push(`⚠️ Densimetro scaduto (scadenza: ${formatDate(strumenti.densScad)})`);
    }
  }

  return warnings;
}

export function checkScadenzePreventive(strumenti, operatore) {
  const warnings = [];

  if (strumenti.multScad && operatore.data && strumenti.multScad < operatore.data) {
    warnings.push(`⚠️ Multimetro scaduto (scadenza: ${formatDate(strumenti.multScad)})`);
  }

  if (strumenti.densScad && operatore.data && strumenti.densScad < operatore.data) {
    warnings.push(`⚠️ Densimetro scaduto (scadenza: ${formatDate(strumenti.densScad)})`);
  }

  return warnings;
}

// ==================== UTILITIES ====================
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
}

export function formatDataProduzione(value) {
  // Rimuovi tutto tranne i numeri
  let cleaned = value.replace(/[^\d]/g, '');
  
  // Limita a 6 cifre (mmaaaa)
  if (cleaned.length > 6) {
    cleaned = cleaned.substring(0, 6);
  }
  
  // Inserisci / dopo i primi 2 caratteri
  if (cleaned.length > 2) {
    cleaned = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
  }
  
  return cleaned;
}

// ==================== SCADENZE IMMINENTI ====================
export function checkScadenzeImminenti(strumenti, giorni = 20) {
  const warnings = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkScadenza = (scadenzaStr, nomeStrumento, idStrumento) => {
    if (!scadenzaStr) return;
    
    const scadenza = new Date(scadenzaStr);
    scadenza.setHours(0, 0, 0, 0);
    
    const diffTime = scadenza.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      warnings.push({
        tipo: 'scaduto',
        strumento: nomeStrumento,
        id: idStrumento,
        scadenza: formatDate(scadenzaStr),
        giorni: diffDays,
        message: `${nomeStrumento} ${idStrumento} SCADUTO (${formatDate(scadenzaStr)})`
      });
    } else if (diffDays <= giorni) {
      warnings.push({
        tipo: 'imminente',
        strumento: nomeStrumento,
        id: idStrumento,
        scadenza: formatDate(scadenzaStr),
        giorni: diffDays,
        message: `${nomeStrumento} ${idStrumento} scade tra ${diffDays} giorni (${formatDate(scadenzaStr)})`
      });
    }
  };
  
  if (strumenti.multId && strumenti.multScad) {
    checkScadenza(strumenti.multScad, '🔧 Multimetro', strumenti.multId);
  }
  
  if (strumenti.densId && strumenti.densScad) {
    checkScadenza(strumenti.densScad, '🔬 Densimetro', strumenti.densId);
  }
  
  // Ordina per giorni rimanenti (più urgenti prima)
  warnings.sort((a, b) => a.giorni - b.giorni);
  
  return warnings;
}

export function getScadenzaColor(giorni) {
  if (giorni <= 0) return 'danger';      // Rosso - scaduto
  if (giorni <= 10) return 'warning-high'; // Arancione
  return 'warning';                       // Giallo
}

// ==================== VALIDAZIONE EVN (Numero Veicolo) ====================
/**
 * Calcola il check digit EVN con algoritmo di Luhn modificato
 * @param {string} numero - Prime 11 cifre del numero veicolo
 * @returns {number} - Check digit (0-9)
 */
export function calcolaCheckDigitEVN(numero) {
  const cifre = numero.replace(/\D/g, '').slice(0, 11);
  
  if (cifre.length !== 11) return null;
  
  let somma = 0;
  
  for (let i = 0; i < 11; i++) {
    let cifra = parseInt(cifre[i], 10);
    
    // Posizioni dispari (1, 3, 5, 7, 9, 11) → indici 0, 2, 4, 6, 8, 10
    if (i % 2 === 0) {
      cifra *= 2;
      if (cifra > 9) cifra -= 9;
    }
    
    somma += cifra;
  }
  
  return (10 - (somma % 10)) % 10;
}

/**
 * Valida numero veicolo EVN completo (12 cifre)
 * @param {string} numero - Numero veicolo (con o senza trattino)
 * @returns {object} - { valido: boolean, errore: string, formattato: string }
 */
export function validaNumeroVeicolo(numero) {
  const soloNumeri = numero.replace(/[\s-]/g, '');
  
  if (soloNumeri.length !== 12) {
    return {
      valido: false,
      errore: `Il numero veicolo deve avere 12 cifre (inserite: ${soloNumeri.length})`,
      formattato: numero
    };
  }
  
  if (!/^\d{12}$/.test(soloNumeri)) {
    return {
      valido: false,
      errore: 'Il numero veicolo deve contenere solo cifre',
      formattato: numero
    };
  }
  
  const prime11 = soloNumeri.slice(0, 11);
  const checkDigitInserito = parseInt(soloNumeri[11], 10);
  const checkDigitCorretto = calcolaCheckDigitEVN(prime11);
  const formattato = `${prime11}-${checkDigitInserito}`;
  
  if (checkDigitInserito !== checkDigitCorretto) {
    return {
      valido: false,
      errore: `Check digit errato. Inserito: ${checkDigitInserito}, corretto: ${checkDigitCorretto}`,
      formattato: formattato
    };
  }
  
  return {
    valido: true,
    errore: null,
    formattato: formattato
  };
}

// ==================== VALIDAZIONE ODL ====================
/**
 * Valida ODL
 * @param {string} odl - Numero ODL
 * @returns {object} - { valido: boolean, errore: string }
 */
export function validaODL(odl) {
  const odlPulito = odl.replace(/\s/g, '');
  
  if (!/^\d+$/.test(odlPulito)) {
    return {
      valido: false,
      errore: 'L\'ODL deve contenere solo numeri'
    };
  }
  
  if (odlPulito.length !== 12) {
    return {
      valido: false,
      errore: `L'ODL deve avere 12 cifre (inserite: ${odlPulito.length})`
    };
  }
  
  if (!odlPulito.startsWith('1000')) {
    return {
      valido: false,
      errore: 'L\'ODL deve iniziare con 1000'
    };
  }
  
  return {
    valido: true,
    errore: null
  };
}

// ==================== VALIDAZIONE DENSITÀ SINGOLA ====================
/**
 * Valida singolo valore densità
 * @param {string} valore - Valore densità inserito
 * @returns {object} - { valido: boolean, errore: string, valoreNumerico: number }
 */
export function validaSingolaDensita(valore) {
  if (!valore || valore.toString().trim() === '') {
    return {
      valido: false,
      errore: 'Valore densità mancante',
      valoreNumerico: null
    };
  }
  
  const valorePulito = valore.toString().replace(',', '.');
  const numero = parseFloat(valorePulito);
  
  if (isNaN(numero)) {
    return {
      valido: false,
      errore: 'Valore densità non valido',
      valoreNumerico: null
    };
  }
  
  if (numero < 1.01 || numero > 1.40) {
    return {
      valido: false,
      errore: `Densità fuori range (${numero}). Deve essere tra 1.01 e 1.40`,
      valoreNumerico: numero
    };
  }
  
  return {
    valido: true,
    errore: null,
    valoreNumerico: numero
  };
}

/**
 * Valida tutti i valori densità di un pacco
 * @param {object} data - Dati veicolo
 * @param {string} prefix - Prefisso campo (d1_, d2_)
 * @param {number} paccoNum - Numero pacco (1 o 2)
 * @returns {array} - Array di errori
 */
export function validaDensitaPacco(data, prefix, paccoNum) {
  const errori = [];
  
  for (let i = 1; i <= 12; i++) {
    const campo = `${prefix}${i}`;
    const valore = data[campo];
    
    if (valore) {
      const risultato = validaSingolaDensita(valore);
      if (!risultato.valido) {
        errori.push(`Pacco ${paccoNum}, elemento ${i}: ${risultato.errore}`);
      }
    }
  }
  
  return errori;
}

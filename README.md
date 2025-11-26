# EFF BATT - App Verifica Efficienza Batterie

App PWA per la compilazione di moduli di verifica efficienza batterie su veicoli ferroviari.

## Funzionalità

- ✅ Gestione sedi tecniche e veicoli
- ✅ Form multi-step per compilazione dati
- ✅ Supporto scadenze 3 mesi e 6 mesi
- ✅ Validazioni in tempo reale
- ✅ Generazione PDF compilati
- ✅ Condivisione report via email/app
- ✅ Funzionamento offline (PWA)
- ✅ Installabile su smartphone

## Installazione locale per sviluppo

```bash
# Clona il repository
git clone https://github.com/papo89/eff-batt-pwa.git
cd eff-batt-pwa

# Installa dipendenze
npm install

# Avvia server di sviluppo
npm run dev
```

## Build e Deploy

```bash
# Crea build di produzione
npm run build

# Deploy su GitHub Pages
npm run deploy
```

## Utilizzo

### Prima configurazione
1. Apri l'app dal browser
2. Carica il PDF template
3. Il template viene salvato offline

### Compilazione report
1. Inserisci dati operatore e strumenti
2. Aggiungi sede tecnica e ODL
3. Aggiungi veicoli (max 8 per sede)
4. Compila il form multi-step
5. Genera e condividi il PDF

### Installazione PWA
- **Android**: Menu browser → "Aggiungi a schermata Home"
- **iOS**: Condividi → "Aggiungi a Home"

## Struttura progetto

```
eff-batt-pwa/
├── public/
│   └── icons/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Home.jsx
│   │   ├── SedeForm.jsx
│   │   ├── VehicleModal.jsx
│   │   ├── VehicleForm.jsx
│   │   ├── PdfSetup.jsx
│   │   ├── Toast.jsx
│   │   ├── ShareModal.jsx
│   │   └── PWAPrompt.jsx
│   ├── utils/
│   │   ├── storage.js
│   │   ├── validation.js
│   │   └── pdfGenerator.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

## Tecnologie

- React 18
- Vite
- pdf-lib (generazione PDF)
- idb (IndexedDB)
- Vite PWA Plugin

## Note

- I dati vengono salvati localmente nel dispositivo
- Il PDF template viene memorizzato in IndexedDB
- I report generati possono essere condivisi o scaricati
- L'app funziona completamente offline dopo la prima installazione

import React from 'react';

function GuidaModal({ onClose }) {
  return (
    <div className="modal-overlay show">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content guida-modal">
        <div className="modal-header">
          <h3>📖 Guida all'utilizzo</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body guida-content">
          <section className="guida-section">
            <h4>🛠️ 1. Configurazione iniziale</h4>
            <ul>
              <li>Al primo avvio, carica il PDF template vuoto della verifica batterie</li>
              <li>Compila i dati operatore (Nome, CID, Data)</li>
              <li>Inserisci gli strumenti di misura (Multimetro e Densimetro con scadenze)</li>
            </ul>
          </section>

          <section className="guida-section">
            <h4>📍 2. Aggiungi Sede Tecnica</h4>
            <ul>
              <li>Scorri alla scheda "Sedi"</li>
              <li>Tocca "+ Aggiungi Sede"</li>
              <li>Inserisci nome sede e numero ODL</li>
            </ul>
          </section>

          <section className="guida-section">
            <h4>🚃 3. Aggiungi Veicoli</h4>
            <ul>
              <li>Nella sede, tocca "+ Aggiungi Veicolo"</li>
              <li>Inserisci NEV (viene validato automaticamente)</li>
              <li>Seleziona tipo verifica: 3 Mesi, 6 Mesi o entrambe</li>
            </ul>
          </section>

          <section className="guida-section">
            <h4>✏️ 4. Compila i dati</h4>
            <ul>
              <li>Tocca il veicolo per aprire la compilazione</li>
              <li><strong>Batterie</strong>: dati produzione, costruttore, S/N</li>
              <li><strong>Misurazioni</strong>: V Multi, V Vettura, I Vettura per ID.2/4/5/6</li>
              <li><strong>Densità</strong> (solo 6 Mesi): 12 elementi per pacco</li>
              <li><strong>Esito</strong>: Positivo o Negativo + eventuali note</li>
              <li>Naviga con swipe orizzontale o bottoni Avanti/Indietro</li>
            </ul>
          </section>

          <section className="guida-section">
            <h4>📄 5. Genera PDF</h4>
            <ul>
              <li>Dall'ultima scheda, tocca "📄 Genera PDF"</li>
            </ul>
          </section>

          <section className="guida-section">
            <h4>📤 6. Condividi</h4>
            <ul>
              <li>Tocca l'icona 📤 in alto a destra</li>
              <li>Seleziona i report da inviare</li>
              <li>Condividi via email, WhatsApp o salva</li>
            </ul>
          </section>

          <section className="guida-section">
            <h4>📚 7. Storico</h4>
            <ul>
              <li>Il report viene salvato nello Storico dopo la condivisione</li>
            </ul>
          </section>

          <section className="guida-section suggerimenti">
            <h4>💡 Suggerimenti</h4>
            <ul>
              <li>✅ = tutti i campi compilati</li>
              <li>📄 = report generato</li>
              <li>Usa "Riempi tutti" per densità uniformi</li>
              <li>Lo schermo resta acceso durante la compilazione (attivabile nelle impostazioni)</li>
            </ul>
          </section>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Ho capito
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuidaModal;

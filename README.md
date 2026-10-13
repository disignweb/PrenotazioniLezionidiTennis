# PrenotazioniLezionidiTennis
# 🎾 Tennis Club - Sistema di Prenotazione Campi & Lezioni

Un'applicazione web semplice, intuitiva e *responsive* per la gestione della prenotazione di campi da tennis in terra rossa e lezioni con i maestri del club. Il progetto è pronto per essere ospitato gratuitamente su **GitHub Pages** e integra l'invio immediato delle richieste di prenotazione tramite **WhatsApp**.

---

## 🚀 Caratteristiche Principali

* **🏟️ Gestione 4 Campi in Terra Rossa**:
  * **Campi 1 e 3**: Ciclo orario dalle **9:30 alle 22:30** (es. `09:30 - 10:30`).
  * **Campi 2 e 4**: Ciclo orario dalle **9:00 alle 22:00** (es. `09:00 - 10:00`).
* **📖 Gestione Lezioni**:
  * **Lezioni Singole**: 30€ / ora.
  * **Lezioni di Gruppo**: 15€ / persona all'ora (con campo dinamico per l'inserimento dei nomi di tutti i partecipanti).
* **📱 Notifica Istantanea tramite WhatsApp**: Invio della scheda di prenotazione formattata con nome, telefono, orario, campo e dettagli del gruppo direttamente al numero di telefono del circolo.
* **⚠️ Regolamento & Requisiti Integrate**:
  * Obbligo di dichiarare il possesso di un **certificato medico in corso di validità**.
  * Termine di **disdetta obbligatorio di 3 giorni (72 ore)**.
* **💾 Prevenzione Overbooking Locale**: Salvataggio e controllo disponibilità in tempo reale tramite `localStorage`.

---

## 📁 Struttura del Progetto

```text
├── index.html    # Struttura della pagina e moduli di prenotazione
├── style.css     # Stili grafici e layout responsive (tema Tennis Club)
├── script.js    # Logic di selezione orari, validazione e integrazione WhatsApp
└── README.md     # Documentazione del progetto

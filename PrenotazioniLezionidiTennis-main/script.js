// ==========================================
// CONFIGURAZIONE DINAMICA E SICURA (Nessun dato su GitHub)
// ==========================================

// Recupera le credenziali salvate in precedenza nel browser (se configurate)
let TELEGRAM_BOT_TOKEN = localStorage.getItem("tennis_bot_token") || "";
let TELEGRAM_CHAT_ID = localStorage.getItem("tennis_chat_id") || "";
let GOOGLE_SCRIPT_URL = localStorage.getItem("tennis_google_url") || "";

// Funzione di servizio per configurare il bot la prima volta (inserendo una password di protezione)
window.configuraBotSicuro = function() {
    const password = prompt("Inserisci la password amministratore per configurare il Bot:");
    if (password !== "tennis2026") { // Puoi cambiare la password qui se vuoi
        alert("Password errata!");
        return;
    }

    const token = prompt("Inserisci il Telegram Bot Token:", TELEGRAM_BOT_TOKEN);
    const chatId = prompt("Inserisci il Telegram Chat ID:", TELEGRAM_CHAT_ID);
    const googleUrl = prompt("Inserisci l'URL di Google Apps Script:", GOOGLE_SCRIPT_URL);

    if (token && chatId) {
        localStorage.setItem("tennis_bot_token", token);
        localStorage.setItem("tennis_chat_id", chatId);
        if (googleUrl) localStorage.setItem("tennis_google_url", googleUrl);
        
        TELEGRAM_BOT_TOKEN = token;
        TELEGRAM_CHAT_ID = chatId;
        GOOGLE_SCRIPT_URL = googleUrl || "";
        
        alert("✅ Configurazione salvata con successo su questo dispositivo!");
        location.reload();
    } else {
        alert("Configurazione annullata o incompleta.");
    }
};

const paginaAttuale = window.location.pathname.split("/").pop();

// ==========================================
// 1. CONTROLLO ACCESSO PAGINA PRENOTAZIONI
// ==========================================
if (paginaAttuale === "prenota.html" || paginaAttuale.endsWith("prenota.html")) {
    const datiAtleta = JSON.parse(localStorage.getItem("iscrizioneAtletaTennis"));
    
    if (!datiAtleta) {
        alert("⚠️ Per accedere alla prenotazione delle lezioni devi PRIMA compilare la scheda di iscrizione e allegare il certificato medico!");
        window.location.href = "index.html";
    } else {
        const testoAtleta = document.querySelector("#testoAtletaConfermato");
        if (testoAtleta) {
            testoAtleta.innerHTML = `Iscrizione confermata per <strong>${datiAtleta.nome}</strong> (Tel: ${datiAtleta.telefono}). Scegli la data e l'ora desiderata per la lezione.`;
        }
    }
}

// ==========================================
// 2. GESTIONE FORM ISCRIZIONE (index.html)
// ==========================================
const formIscrizione = document.querySelector("#formIscrizione");
if (formIscrizione) {
    const certificatoInput = document.querySelector("#certificatoMedico");
    const filePreview = document.querySelector("#filePreview");
    const alertMessaggio = document.querySelector("#alertMessaggio");

    certificatoInput.addEventListener("change", function() {
        if (certificatoInput.files && certificatoInput.files[0]) {
            const file = certificatoInput.files[0];
            filePreview.textContent = `📄 File selezionato: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        }
    });

    formIscrizione.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            alert("⚠️ Attenzione: Il bot non è configurato su questo browser! Clicca sul tasto di configurazione nascosto o contatta l'amministratore.");
            return;
        }

        const nome = document.querySelector("#nomeAtleta").value;
        const cf = document.querySelector("#codiceFiscale").value.toUpperCase();
        const dataNascita = document.querySelector("#dataNascita").value;
        const telefono = document.querySelector("#telefono").value;
        const email = document.querySelector("#email").value;
        const indirizzo = document.querySelector("#indirizzo").value;
        const livello = document.querySelector("#livelloTennis").value;
        const scadenzaCertificato = document.querySelector("#scadenzaCertificato").value;
        const fileCertificato = certificatoInput.files[0];

        if (!fileCertificato) {
            alert("Per favore, carica il certificato medico!");
            return;
        }

        const dataScadenzaFormattata = scadenzaCertificato.split('-').reverse().join('/');

        const datiAtleta = {
            nome: nome,
            codiceFiscale: cf,
            dataNascita: dataNascita,
            telefono: telefono,
            email: email,
            indirizzo: indirizzo,
            livello: livello,
            scadenzaCertificato: dataScadenzaFormattata,
            nomeCertificato: fileCertificato.name
        };
        localStorage.setItem("iscrizioneAtletaTennis", JSON.stringify(datiAtleta));

        const payloadGoogle = {
            nome: nome,
            codiceFiscale: cf,
            dataNascita: dataNascita,
            telefono: telefono,
            email: email,
            indirizzo: indirizzo,
            livello: livello,
            scadenzaCertificato: scadenzaCertificato,
            scadenzaCertificatoFormatted: dataScadenzaFormattata
        };

        try {
            // A. Invio a Google Sheets (se configurato)
            if (GOOGLE_SCRIPT_URL) {
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: "POST",
                    mode: "no-cors",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payloadGoogle)
                });
            } else {
                // Notifica testuale di emergenza via Telegram se manca Google Script
                const testoMessaggio = 
                    `📋 *NUOVA ISCRIZIONE ATLETA* 📋\n\n` +
                    `👤 *Nome:* ${nome}\n` +
                    `🆔 *CF:* ${cf}\n` +
                    `📞 *Tel:* ${telefono}\n` +
                    `🚨 *SCADENZA CERTIFICATO:* ${dataScadenzaFormattata}`;

                await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: testoMessaggio, parse_mode: "Markdown" })
                });
            }

            // B. Invio File Certificato (Foto o PDF) su Telegram
            const formData = new FormData();
            formData.append("chat_id", TELEGRAM_CHAT_ID);

            let endpoint = "sendDocument";
            if (fileCertificato.type.startsWith("image/")) {
                endpoint = "sendPhoto";
                formData.append("photo", fileCertificato);
            } else {
                formData.append("document", fileCertificato);
            }

            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${endpoint}`, {
                method: "POST",
                body: formData
            });

            alertMessaggio.style.display = "block";
            setTimeout(() => {
                window.location.href = "prenota.html";
            }, 2000);

        } catch (error) {
            console.error("Errore:", error);
            alert("Errore di connessione durante l'invio.");
        }
    });
}

// ==========================================
// 3. GESTIONE FORM PRENOTAZIONE (prenota.html)
// ==========================================
const formPrenotazione = document.querySelector("#formPrenotazione");
if (formPrenotazione) {
    const tipoLezioneSelect = document.querySelector("#tipoLezione");
    const gruppoPartecipanti = document.querySelector("#gruppoPartecipanti");
    const alertMessaggio = document.querySelector("#alertMessaggio");
    const contenitoreLista = document.querySelector("#contenitoreLista");

    tipoLezioneSelect.addEventListener("change", function() {
        if (tipoLezioneSelect.value === "Gruppo") {
            gruppoPartecipanti.style.display = "block";
        } else {
            gruppoPartecipanti.style.display = "none";
        }
    });

    function caricaPrenotazioni() {
        let prenotazioni = JSON.parse(localStorage.getItem("prenotazioniLezioniTennis")) || [];

        if (prenotazioni.length === 0) {
            contenitoreLista.innerHTML = "<p style='color: #7f8c8d;'>Nessuna prenotazione inviata di recente da questo browser.</p>";
            return;
        }

        contenitoreLista.innerHTML = "";
        prenotazioni.forEach((p, index) => {
            const div = document.createElement("div");
            div.className = "item-prenotazione";
            
            let dettaglioMembri = p.tipo === "Gruppo" && p.partecipanti ? `<br><small>👥 Gruppo con: ${p.partecipanti}</small>` : '';

            div.innerHTML = `
                <div>
                    <strong>${p.nomeAtleta}</strong> (${p.tipo === 'Singola' ? 'Lezione Singola 30€' : 'Lezione Gruppo 15€/cad.'})${dettaglioMembri}<br>
                    <span>⏰ <strong>Data e Ora:</strong> ${p.orarioDesiderato}</span>
                </div>
                <button class="btn-cancella" onclick="eliminaPrenotazione(${index})">Elimina</button>
            `;
            contenitoreLista.appendChild(div);
        });
    }

    window.eliminaPrenotazione = function(index) {
        let prenotazioni = JSON.parse(localStorage.getItem("prenotazioniLezioniTennis")) || [];
        prenotazioni.splice(index, 1);
        localStorage.setItem("prenotazioniLezioniTennis", JSON.stringify(prenotazioni));
        caricaPrenotazioni();
    };

    formPrenotazione.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            alert("⚠️ Attenzione: Il bot non è configurato su questo browser!");
            return;
        }

        const datiAtleta = JSON.parse(localStorage.getItem("iscrizioneAtletaTennis"));
        const tipoLezione = tipoLezioneSelect.value;
        const altriPartecipanti = document.querySelector("#partecipanti").value;
        const orarioDesiderato = document.querySelector("#dataOrarioDesiderato").value;

        let prenotazioni = JSON.parse(localStorage.getItem("prenotazioniLezioniTennis")) || [];

        const nuovaPrenotazione = {
            nomeAtleta: datiAtleta.nome,
            telefonoAtleta: datiAtleta.telefono,
            tipo: tipoLezione,
            partecipanti: altriPartecipanti,
            orarioDesiderato: orarioDesiderato
        };

        prenotazioni.push(nuovaPrenotazione);
        localStorage.setItem("prenotazioniLezioniTennis", JSON.stringify(prenotazioni));

        let testoPartecipanti = tipoLezione === "Gruppo" ? `\n👥 *Altri Partecipanti:* ${altriPartecipanti}` : '';
        let costo = tipoLezione === "Singola" ? "30€" : "15€ a persona";

        const testoMessaggio = 
            `🎾 *NUOVA PRENOTAZIONE LEZIONE* 🎾\n\n` +
            `👤 *Atleta:* ${datiAtleta.nome}\n` +
            `📞 *Telefono:* ${datiAtleta.telefono}\n` +
            `📖 *Tipo Lezione:* ${tipoLezione} (${costo})${testoPartecipanti}\n` +
            `⏰ *Giorno e Ora Desiderati:* ${orarioDesiderato}\n` +
            `💶 *Pagamento:* Diretto al maestro prima della lezione`;

        try {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: testoMessaggio, parse_mode: "Markdown" })
            });

            alertMessaggio.style.display = "block";
            setTimeout(() => { alertMessaggio.style.display = "none"; }, 4000);
            formPrenotazione.reset();
            gruppoPartecipanti.style.display = "none";
            caricaPrenotazioni();

        } catch (error) {
            console.error("Errore:", error);
            alert("Errore nell'invio della prenotazione.");
        }
    });

    caricaPrenotazioni();
}

// ==========================================
// CONFIGURAZIONE TELEGRAM SICURA (Da localStorage)
// ==========================================
let TELEGRAM_BOT_TOKEN = localStorage.getItem("tennis_bot_token") || "";
let TELEGRAM_CHAT_ID = localStorage.getItem("tennis_chat_id") || "";

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

        // Aggiorna i token da localStorage al momento dell'invio
        TELEGRAM_BOT_TOKEN = localStorage.getItem("tennis_bot_token") || "";
        TELEGRAM_CHAT_ID = localStorage.getItem("tennis_chat_id") || "";

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            alert("⚠️ Attenzione: Il bot non è configurato su questo browser! Clicca sul tasto '⚙️ Configura Bot Telegram' in fondo alla pagina.");
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

        const testoMessaggio = 
            `📋 NUOVA ISCRIZIONE ATLETA\n\n` +
            `Nome: ${nome}\n` +
            `Codice Fiscale: ${cf}\n` +
            `Data Nascita: ${dataNascita}\n` +
            `Telefono: ${telefono}\n` +
            `Email: ${email}\n` +
            `Indirizzo: ${indirizzo}\n` +
            `Livello: ${livello}\n` +
            `🚨 SCADENZA CERTIFICATO: ${dataScadenzaFormattata}\n` +
            `File Certificato: ${fileCertificato.name}`;

        try {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: testoMessaggio })
            });

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
            alert("Errore di connessione durante l'invio dei dati.");
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

        TELEGRAM_BOT_TOKEN = localStorage.getItem("tennis_bot_token") || "";
        TELEGRAM_CHAT_ID = localStorage.getItem("tennis_chat_id") || "";

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            alert("⚠️ Attenzione: Il bot non è configurato su questo browser!");
            return;
        }

        const datiAtleta = JSON.parse(localStorage.getItem("iscrizioneAtletaTennis"));
        const tipoLezione = tipoLezioneSelect.value;
        const altriPartecipanti = document.querySelector("#partecipanti").value;
        const orarioDesiderato = document.querySelector("#dataOrarioDesiderato").value;

        let prenotazioni = JSON.parse(localStorage.getItem("prenotazioniLezioniTennis")) || [];

        const nuvapr = {
            nomeAtleta: datiAtleta.nome,
            telefonoAtleta: datiAtleta.telefono,
            tipo: tipoLezione,
            partecipanti: altriPartecipanti,
            orarioDesiderato: orarioDesiderato
        };

        prenotazioni.push(nuvapr);
        localStorage.setItem("prenotazioniLezioniTennis", JSON.stringify(prenotazioni));

        let testoPartecipanti = tipoLezione === "Gruppo" ? `\nAltri Partecipanti: ${altriPartecipanti}` : '';
        let costo = tipoLezione === "Singola" ? "30€" : "15€ a persona";

        const testoMessaggio = 
            `🎾 NUOVA PRENOTAZIONE LEZIONE\n\n` +
            `Atleta: ${datiAtleta.nome}\n` +
            `Telefono: ${datiAtleta.telefono}\n` +
            `Tipo Lezione: ${tipoLezione} (${costo})${testoPartecipanti}\n` +
            `Giorno e Ora Desiderati: ${orarioDesiderato}\n` +
            `Pagamento: Diretto al maestro prima della lezione`;

        try {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: testoMessaggio })
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

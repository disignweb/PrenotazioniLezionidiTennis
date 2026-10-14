// CONFIGURAZIONE TELEGRAM BOT CON I TUOI DATI REALI
const TELEGRAM_BOT_TOKEN = "8735773734:AAHRixPREQqkROnTra7XLiokNdZzul-1xJ8"; 
const TELEGRAM_CHAT_ID = "8008704752"; 

const paginaAttuale = window.location.pathname.split("/").pop();

// --- CONTROLLO ACCESSO ALLA PAGINA PRENOTAZIONI ---
if (paginaAttuale === "prenota.html" || paginaAttuale.endsWith("prenota.html")) {
    const datiAtleta = JSON.parse(localStorage.getItem("iscrizioneAtletaTennis"));
    
    // Se non si è ancora iscritto, viene bloccato e rimandato alla home
    if (!datiAtleta) {
        alert("⚠️ Per accedere alla prenotazione delle lezioni devi PRIMA compilare la scheda di iscrizione e allegare il certificato medico!");
        window.location.href = "index.html";
    } else {
        const testoAtleta = document.querySelector("#testoAtletaConfermato");
        if (testoAtleta) {
            testoAtleta.innerHTML = `Iscrizione confermata per <strong>${datiAtleta.nome}</strong> (Tel: ${datiAtleta.telefono}). Scegli la data e l'ora desiderata.`;
        }
    }
}

// --- GESTIONE FORM ISCRIZIONE (index.html) ---
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

        const nome = document.querySelector("#nomeAtleta").value;
        const cf = document.querySelector("#codiceFiscale").value.toUpperCase();
        const dataNascita = document.querySelector("#dataNascita").value;
        const telefono = document.querySelector("#telefono").value;
        const email = document.querySelector("#email").value;
        const indirizzo = document.querySelector("#indirizzo").value;
        const livello = document.querySelector("#livelloTennis").value;
        const fileCertificato = certificatoInput.files[0];

        if (!fileCertificato) {
            alert("Per favore, carica il certificato medico!");
            return;
        }

        // Salvataggio dati atleta in locale per sbloccare la pagina 2
        const datiAtleta = {
            nome: nome,
            codiceFiscale: cf,
            dataNascita: dataNascita,
            telefono: telefono,
            email: email,
            indirizzo: indirizzo,
            livello: livello,
            nomeCertificato: fileCertificato.name
        };
        localStorage.setItem("iscrizioneAtletaTennis", JSON.stringify(datiAtleta));

        const testoMessaggio = 
            `📋 *NUOVA ISCRIZIONE ATLETA* 📋\n\n` +
            `👤 *Nome:* ${nome}\n` +
            `🆔 *Codice Fiscale:* ${cf}\n` +
            `📅 *Data Nascita:* ${dataNascita}\n` +
            `📞 *Telefono:* ${telefono}\n` +
            `✉️ *Email:* ${email}\n` +
            `🏠 *Indirizzo:* ${indirizzo}\n` +
            `🎾 *Livello:* ${livello}\n` +
            `📄 *Certificato:* ${fileCertificato.name}`;

        try {
            // Invio Dati Testo
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: testoMessaggio, parse_mode: "Markdown" })
            });

            // Invio Certificato Medico (Foto o PDF)
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
            
            // Reindirizzamento automatico alla pagina prenotazioni dopo 2 secondi
            setTimeout(() => {
                window.location.href = "prenota.html";
            }, 2000);

        } catch (error) {
            console.error(error);
            alert("Errore nell'invio a Telegram. Verifica la tua connessione internet.");
        }
    });
}

// --- GESTIONE FORM PRENOTAZIONE (prenota.html) ---
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
            contenitoreLista.innerHTML = "<p style='color: #7f8c8d;'>Nessuna prenotazione inviata.</p>";
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
            `⏰ *Giorno e Ora Desiderati:* ${orarioDesiderato}`;

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
            console.error(error);
            alert("Errore nell'invio della prenotazione.");
        }
    });

    caricaPrenotazioni();
}

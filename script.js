// CONFIGURAZIONE TELEGRAM BOT (GIÀ CONFIGURATA CON I TUOI DATI REAL)
const TELEGRAM_BOT_TOKEN = "8735773734:AAHRixPREQqkROnTra7XLiokNdZzul-1xJ8"; 
const TELEGRAM_CHAT_ID = "8008704752"; 

const tipoLezioneSelect = document.querySelector("#tipoLezione");
const gruppoPartecipanti = document.querySelector("#gruppoPartecipanti");
const campoSelect = document.querySelector("#campo");
const dataOrarioInput = document.querySelector("#dataOrarioDesiderato");
const form = document.querySelector("#formTennis");
const alertMessaggio = document.querySelector("#alertMessaggio");
const contenitoreLista = document.querySelector("#contenitoreLista");

tipoLezioneSelect.addEventListener("change", function() {
    if (tipoLezioneSelect.value === "Gruppo") {
        gruppoPartecipanti.style.display = "block";
    } else {
        gruppoPartecipanti.style.display = "none";
    }
});

function caricaRichieste() {
    let richieste = JSON.parse(localStorage.getItem("richiesteCampiTerraTelegram")) || [];

    if (richieste.length === 0) {
        contenitoreLista.innerHTML = "<p style='color: #7f8c8d;'>Nessuna richiesta attiva nel browser.</p>";
        return;
    }

    contenitoreLista.innerHTML = "";
    richieste.forEach((r, index) => {
        const div = document.createElement("div");
        div.className = "item-prenotazione";
        
        let dettaglioMembri = r.tipo === "Gruppo" && r.partecipanti ? `<br><small>👥 Gruppo con: ${r.partecipanti}</small>` : '';
        let telUtente = r.telefono ? `<br><small>📞 Tel: ${r.telefono}</small>` : '';

        div.innerHTML = `
            <div>
                <strong>${r.nome}</strong> (${r.tipo === 'Singola' ? 'Singola 30€' : 'Gruppo 15€/cad.'})${telUtente}${dettaglioMembri}<br>
                <span>🏟️ ${r.campo} | ⏰ ${r.orarioDesiderato}</span>
            </div>
            <button class="btn-cancella" onclick="eliminaRichiesta(${index})">Elimina</button>
        `;
        contenitoreLista.appendChild(div);
    });
}

function eliminaRichiesta(index) {
    let richieste = JSON.parse(localStorage.getItem("richiesteCampiTerraTelegram")) || [];
    richieste.splice(index, 1);
    localStorage.setItem("richiesteCampiTerraTelegram", JSON.stringify(richieste));
    caricaRichieste();
}

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const tipoLezione = tipoLezioneSelect.value;
    const nomeUtente = document.querySelector("#nome").value;
    const telefonoUtente = document.querySelector("#telefono").value;
    const altriPartecipanti = document.querySelector("#partecipanti").value;
    const campoScelto = campoSelect.value;
    const orarioDesiderato = dataOrarioInput.value;

    let richieste = JSON.parse(localStorage.getItem("richiesteCampiTerraTelegram")) || [];

    const nuovaRichiesta = {
        tipo: tipoLezione,
        nome: nomeUtente,
        telefono: telefonoUtente,
        partecipanti: altriPartecipanti,
        campo: campoScelto,
        orarioDesiderato: orarioDesiderato
    };

    richieste.push(nuovaRichiesta);
    localStorage.setItem("richiesteCampiTerraTelegram", JSON.stringify(richieste));

    // Costruzione messaggio per Telegram
    let testoPartecipanti = tipoLezione === "Gruppo" ? `\n👥 Altri Partecipanti: ${altriPartecipanti}` : '';
    let costoStimato = tipoLezione === "Singola" ? "30€" : "15€ a persona";

    const testoMessaggio = 
        `🎾 NUOVA RICHIESTA LEZIONE TENNIS 🎾\n\n` +
        `📖 Tipo Lezione: ${tipoLezione} (${costoStimato})\n` +
        `👤 Referente: ${nomeUtente}\n` +
        `📞 Telefono: ${telefonoUtente}${testoPartecipanti}\n` +
        `🏟️ Campo Preferito: ${campoScelto}\n` +
        `⏰ Quando lo desidera: ${orarioDesiderato}\n` +
        `✅ Certificato Medico: Dichiarato presente`;

    try {
        const urlTelegram = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const risposta = await fetch(urlTelegram, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: testoMessaggio
            })
        });

        if (risposta.ok) {
            alertMessaggio.style.display = "block";
            setTimeout(() => {
                alertMessaggio.style.display = "none";
            }, 4000);
            form.reset();
            gruppoPartecipanti.style.display = "none";
            caricaRichieste();
        } else {
            alert("Errore nell'invio a Telegram. Assicurati di aver premuto 'Avvia' nella chat con il tuo bot!");
        }
    } catch (error) {
        console.error("Errore di connessione:", error);
        alert("Impossibile connettersi a Telegram. Verifica la connessione internet.");
    }
});

caricaRichieste();
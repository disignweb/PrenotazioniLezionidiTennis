// ⚠️ INSERISCI QUI IL TUO NUMERO REALE (Es. "393331234567" senza + e senza spazi)
const TUO_NUMERO_WHATSAPP = "393398827687"; 

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
    let richieste = JSON.parse(localStorage.getItem("richiesteCampiTerra")) || [];

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
    let richieste = JSON.parse(localStorage.getItem("richiesteCampiTerra")) || [];
    richieste.splice(index, 1);
    localStorage.setItem("richiesteCampiTerra", JSON.stringify(richieste));
    caricaRichieste();
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const tipoLezione = tipoLezioneSelect.value;
    const nomeUtente = document.querySelector("#nome").value;
    const telefonoUtente = document.querySelector("#telefono").value;
    const altriPartecipanti = document.querySelector("#partecipanti").value;
    const campoScelto = campoSelect.value;
    const orarioDesiderato = dataOrarioInput.value;

    let richieste = JSON.parse(localStorage.getItem("richiesteCampiTerra")) || [];

    const nuovaRichiesta = {
        tipo: tipoLezione,
        nome: nomeUtente,
        telefono: telefonoUtente,
        partecipanti: altriPartecipanti,
        campo: campoScelto,
        orarioDesiderato: orarioDesiderato
    };

    richieste.push(nuovaRichiesta);
    localStorage.setItem("richiesteCampiTerra", JSON.stringify(richieste));

    // Costruzione messaggio WhatsApp
    let testoPartecipanti = tipoLezione === "Gruppo" ? `\n👥 *Altri Partecipanti:* ${altriPartecipanti}` : '';
    let costoStimato = tipoLezione === "Singola" ? "30€" : "15€ a persona";

    const testoMessaggio = encodeURIComponent(
        `🎾 *NUOVA RICHIESTA LEZIONE TENNIS* 🎾\n\n` +
        `📖 *Tipo Lezione:* ${tipoLezione} (${costoStimato})\n` +
        `👤 *Referente:* ${nomeUtente}\n` +
        `📞 *Telefono:* ${telefonoUtente}${testoPartecipanti}\n` +
        `🏟️ *Campo Preferito:* ${campoScelto}\n` +
        `⏰ *Quando lo desidera:* ${orarioDesiderato}\n` +
        `✅ *Certificato Medico:* Dichiarato presente`
    );

    const urlWhatsApp = `https://wa.me/${TUO_NUMERO_WHATSAPP}?text=${testoMessaggio}`;
    
    // REINDIRIZZAMENTO DIRETTO (Evita il blocco pop-up del browser)
    window.location.href = urlWhatsApp;
});

caricaRichieste();

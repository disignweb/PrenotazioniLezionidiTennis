// ⚠️ METTI QUI IL TUO NUMERO REALE (Es: "393331234567" senza + e senza spazi)
const TUO_NUMERO_WHATSAPP = "393331234567"; 

const tipoLezioneSelect = document.querySelector("#tipoLezione");
const gruppoPartecipanti = document.querySelector("#gruppoPartecipanti");
const campoSelect = document.querySelector("#campo");
const dataOrarioInput = document.querySelector("#dataOrarioDesiderato");
const form = document.querySelector("#formTennis");
const alertMessaggio = document.querySelector("#alertMessaggio");
const contenitoreLista = document.querySelector("#contenitoreLista");
const btnWhatsApp = document.querySelector("#btnWhatsApp");

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

    // Validazione base dei campi compilati
    const nomeUtente = document.querySelector("#nome").value;
    const telefonoUtente = document.querySelector("#telefono").value;
    const orarioDesiderato = dataOrarioInput.value;

    if (!nomeUtente || !telefonoUtente || !orarioDesiderato) {
        alert("Per favore compila tutti i campi obbligatori prima di procedere.");
        return;
    }

    const tipoLezione = tipoLezioneSelect.value;
    const altriPartecipanti = document.querySelector("#partecipanti").value;
    const campoScelto = campoSelect.value;

    let richieste = JSON.parse(localStorage.getItem("richiesteCampiTerra")) || [];

    const nuevaRichiesta = {
        tipo: tipoLezione,
        nome: nomeUtente,
        telefono: telefonoUtente,
        partecipanti: altriPartecipanti,
        campo: campoScelto,
        orarioDesiderato: orarioDesiderato
    };

    richieste.push(nuevaRichiesta);
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

    // Assegna il link corretto al pulsante WhatsApp nativo
    btnWhatsApp.href = `https://wa.me/${TUO_NUMERO_WHATSAPP}?text=${testoMessaggio}`;

    alertMessaggio.style.display = "block";
    form.reset();
    gruppoPartecipanti.style.display = "none";
    caricaRichieste();
});

caricaRichieste();

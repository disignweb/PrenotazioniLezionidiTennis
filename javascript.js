// ⚠️ INSERISCI QUI IL TUO NUMERO DI TELEFONO CON IL PREFISSO INTERNAZIONALE (es. 39 per l'Italia)
const TUO_NUMERO_WHATSAPP = "393398827687"; 

const tipoLezioneSelect = document.querySelector("#tipoLezione");
const gruppoPartecipanti = document.querySelector("#gruppoPartecipanti");
const campoSelect = document.querySelector("#campo");
const orarioSelect = document.querySelector("#orario");
const form = document.querySelector("#formTennis");
const alertMessaggio = document.querySelector("#alertMessaggio");
const contenitoreLista = document.querySelector("#contenitoreLista");

// Orari distinti per i campi (Campi 1 e 3: 9:30 - 22:30)
const orariCampo1e3 = [
    "09:30 - 10:30", "10:30 - 11:30", "11:30 - 12:30", 
    "12:30 - 13:30", "13:30 - 14:30", "14:30 - 15:30", 
    "15:30 - 16:30", "16:30 - 17:30", "17:30 - 18:30", 
    "18:30 - 19:30", "19:30 - 20:30", "20:30 - 21:30", "21:30 - 22:30"
];

// Orari distinti per i campi (Campi 2 e 4: 9:00 - 22:00)
const orariCampo2e4 = [
    "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", 
    "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", 
    "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00", 
    "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00"
];

// Mostra o nasconde il campo per inserire i nomi del gruppo
tipoLezioneSelect.addEventListener("change", function() {
    if (tipoLezioneSelect.value === "Gruppo") {
        gruppoPartecipanti.style.display = "block";
    } else {
        gruppoPartecipanti.style.display = "none";
    }
});

// Funzione centrale per popolare gli orari in base al campo scelto
function aggiornaOrari() {
    const campo = campoSelect.value;
    orarioSelect.innerHTML = '<option value="">-- Scegli orario --</option>';

    let orariDisponibili = [];
    if (campo === "Campo 1" || campo === "Campo 3") {
        orariDisponibili = orariCampo1e3;
    } else if (campo === "Campo 2" || campo === "Campo 4") {
        orariDisponibili = orariCampo2e4;
    }

    orariDisponibili.forEach(orario => {
        const option = document.createElement("option");
        option.value = orario;
        option.textContent = orario;
        orarioSelect.appendChild(option);
    });
}

// Ascolta il cambio di selezione sul campo
campoSelect.addEventListener("change", aggiornaOrari);
campoSelect.addEventListener("input", aggiornaOrari);

function caricaPrenotazioni() {
    let prenotazioni = JSON.parse(localStorage.getItem("prenotazioniCampiTerra")) || [];

    if (prenotazioni.length === 0) {
        contenitoreLista.innerHTML = "<p style='color: #7f8c8d;'>Nessuna prenotazione attiva sul browser.</p>";
        return;
    }

    contenitoreLista.innerHTML = "";
    prenotazioni.forEach((p, index) => {
        const div = document.createElement("div");
        div.className = "item-prenotazione";
        
        let dettaglioMembri = p.tipo === "Gruppo" && p.partecipanti ? `<br><small>👥 Gruppo con: ${p.partecipanti}</small>` : '';
        let telUtente = p.telefono ? `<br><small>📞 Tel: ${p.telefono}</small>` : '';

        div.innerHTML = `
            <div>
                <strong>${p.nome}</strong> (${p.tipo === 'Singola' ? 'Singola 30€' : 'Gruppo 15€/cad.'})${telUtente}${dettaglioMembri}<br>
                <span>🏟️ ${p.campo} | ⏰ ${p.orario}</span>
            </div>
            <button class="btn-cancella" onclick="eliminaPrenotazione(${index})">Elimina</button>
        `;
        contenitoreLista.appendChild(div);
    });
}

function eliminaPrenotazione(index) {
    let prenotazioni = JSON.parse(localStorage.getItem("prenotazioniCampiTerra")) || [];
    prenotazioni.splice(index, 1);
    localStorage.setItem("prenotazioniCampiTerra", JSON.stringify(prenotazioni));
    caricaPrenotazioni();
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const tipoLezione = tipoLezioneSelect.value;
    const nomeUtente = document.querySelector("#nome").value;
    const telefonoUtente = document.querySelector("#telefono").value;
    const altriPartecipanti = document.querySelector("#partecipanti").value;
    const campoScelto = campoSelect.value;
    const orarioScelto = orarioSelect.value;

    let prenotazioni = JSON.parse(localStorage.getItem("prenotazioniCampiTerra")) || [];

    // Controllo disponibilità
    const giaOccupato = prenotazioni.some(p => p.campo === campoScelto && p.orario === orarioScelto);

    if (giaOccupato) {
        alert("Attenzione: Questo campo risulta già occupato in questo orario!");
        return;
    }

    const nuovaPrenotazione = {
        tipo: tipoLezione,
        nome: nomeUtente,
        telefono: telefonoUtente,
        partecipanti: altriPartecipanti,
        campo: campoScelto,
        orario: orarioScelto
    };

    prenotazioni.push(nuovaPrenotazione);
    localStorage.setItem("prenotazioniCampiTerra", JSON.stringify(prenotazioni));

    // Costruzione del messaggio WhatsApp
    let testoPartecipanti = tipoLezione === "Gruppo" ? `\n👥 *Altri Partecipanti:* ${altriPartecipanti}` : '';
    let costoStimato = tipoLezione === "Singola" ? "30€" : "15€ a persona";

    const testoMessaggio = encodeURIComponent(
        `🎾 *NUOVA PRENOTAZIONE LEZIONE TENNIS* 🎾\n\n` +
        `📖 *Tipo Lezione:* ${tipoLezione} (${costoStimato})\n` +
        `👤 *Referente:* ${nomeUtente}\n` +
        `📞 *Telefono:* ${telefonoUtente}${testoPartecipanti}\n` +
        `🏟️ *Campo:* ${campoScelto}\n` +
        `⏰ *Orario:* ${orarioScelto}\n` +
        `✅ *Certificato Medico:* Dichiarato presente`
    );

    const urlWhatsApp = `https://wa.me/${TUO_NUMERO_WHATSAPP}?text=${testoMessaggio}`;
    window.open(urlWhatsApp, '_blank');

    alertMessaggio.style.display = "block";
    setTimeout(() => {
        alertMessaggio.style.display = "none";
    }, 3500);

    form.reset();
    gruppoPartecipanti.style.display = "none";
    orarioSelect.innerHTML = '<option value="">-- Prima seleziona un campo --</option>';
    caricaPrenotazioni();
});

caricaPrenotazioni();

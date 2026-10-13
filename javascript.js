// ⚠️ SOSTITUISCI IL NUMERO QUI SOTTO CON IL TUO NUMERO REALE (senza +, senza spazi, es: "393331234567")
const TUO_NUMERO_WHATSAPP = "393398827687"; 

document.addEventListener("DOMContentLoaded", function() {
    const tipoLezioneSelect = document.querySelector("#tipoLezione");
    const gruppoPartecipanti = document.querySelector("#gruppoPartecipanti");
    const form = document.querySelector("#formTennis");

    if (tipoLezioneSelect) {
        tipoLezioneSelect.addEventListener("change", function() {
            if (tipoLezioneSelect.value === "Gruppo") {
                gruppoPartecipanti.style.display = "block";
            } else {
                gruppoPartecipanti.style.display = "none";
            }
        });
    }

    if (form) {
        form.addEventListener("submit", function(event) {
            event.preventDefault();

            const tipoLezione = document.querySelector("#tipoLezione").value;
            const nomeUtente = document.querySelector("#nome").value;
            const telefonoUtente = document.querySelector("#telefono").value;
            const altriPartecipanti = document.querySelector("#partecipanti") ? document.querySelector("#partecipanti").value : "";
            const campoScelto = document.querySelector("#campo").value;
            const orarioDesiderato = document.querySelector("#dataOrarioDesiderato").value;

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

            // Reindirizzamento diretto a WhatsApp
            const urlWhatsApp = `https://api.whatsapp.com/send?phone=${TUO_NUMERO_WHATSAPP}&text=${testoMessaggio}`;
            window.location.href = urlWhatsApp;
        });
    }
});

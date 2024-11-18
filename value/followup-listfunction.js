function startFollowinglistElement(data) {
    console.log(data);

    const list = document.getElementById("elementfollowinguplist");
    list.replaceChildren(); // Tømmer holderen for å unngå duplisering

    const elementLibrary = document.getElementById("elementholderfollowup");
    const nodeElement = elementLibrary.querySelector('.rowelementmanuel');

    if (!nodeElement) {
        console.error("Malen '.rowelementmanuel' ble ikke funnet.");
        return;
    }

    // Sorterer data basert på 'nextrenewaldate' (format "YYYY-MM-DD")
    data.sort((a, b) => {
        const dateA = new Date(a.nextrenewaldate);
        const dateB = new Date(b.nextrenewaldate);
        return dateA - dateB;
    });

    const fragment = document.createDocumentFragment();

    data.forEach((company, index) => {
        const rowElement = nodeElement.cloneNode(true);

        if (index % 2 === 1) {
            rowElement.classList.add("grayrow");
        }

        rowElement.querySelector(".companynamelable").textContent = company.Name || "Ukjent";
        rowElement.querySelector(".winningdate").textContent = company.winningdate || "Ingen dato";
        rowElement.querySelector(".lastfollowingup").textContent = company.lastfollowupdate || "-";
        rowElement.querySelector(".daysagain").textContent = company.daytorenewal || "Ingen data";
        rowElement.querySelector(".rewaldate").textContent = company.nextrenewaldate || "Ingen fornyelsesdato";

        // Klikkhendelse på companynamelable
        const companyNameLabel = rowElement.querySelector(".companynamelable");
        companyNameLabel.style.cursor = "pointer";
        companyNameLabel.addEventListener("click", () => {
            handleCompanyClick(company.Name, company.airtable);
        });

        // Klikkhendelse på foreldre-elementet til lastfollowingup
        const followupParentElement = rowElement.querySelector(".status");
        followupParentElement.style.cursor = "pointer";
        followupParentElement.addEventListener("click", () => {
            handleFollowupStatusClick(company.Name, company.airtable);
        });

        // Håndterer oppfølgingsnotat eller knapp for å legge til notat
        const noteElement = rowElement.querySelector(".textlablemanuel.note");
        const noteContainer = rowElement.querySelector(".textholder.note");

        if (company.followupnote && noteElement && noteContainer) {
            noteElement.textContent = company.followupnote;
            noteContainer.style.display = "block";

            // Klikkhendelse for redigering av notatet
            noteElement.style.cursor = "pointer";
            noteElement.addEventListener("click", () => {
                editFollowupNote(noteElement, company.airtable);
            });
        } else if (noteContainer) {
            // Skjuler notatelementet og viser "Legg til notat"-knapp
            noteContainer.style.display = "none";

            const addNoteButton = document.createElement("button");
            addNoteButton.textContent = "Legg til notat";
            addNoteButton.classList.add("add-note-button");
            addNoteButton.style.backgroundColor = "#f0f0f0"; // Sett bakgrunnsfargen her

            // Klikkhendelse for å legge til notat
            addNoteButton.addEventListener("click", () => {
                editFollowupNote(addNoteButton, company.airtable);
            });

            // Legger til knappen i noteContainer
            noteContainer.appendChild(addNoteButton);
            noteContainer.style.display = "block";
        }

        fragment.appendChild(rowElement);
    });

    list.appendChild(fragment);
}

// Funksjon for å redigere notatet
function editFollowupNote(noteElement, airtableId) {
    const currentText = noteElement.textContent;
    const textarea = document.createElement("textarea");
    textarea.value = currentText;
    textarea.classList.add("note-editor");

    // Lagre-knapp
    const saveButton = document.createElement("button");
    saveButton.textContent = "Lagre";
    saveButton.classList.add("save-note-button");

    // Erstatter notatet med textarea og lagre-knapp
    noteElement.replaceWith(textarea);
    textarea.after(saveButton);

    // Fokus på textarea
    textarea.focus();

    // Funksjon for å lagre oppdateringen
    saveButton.addEventListener("click", () => {
        const updatedText = textarea.value;
        saveFollowupNote(updatedText, airtableId, textarea, saveButton, noteElement);
    });
}

// Funksjon for å lagre oppdatert notat
function saveFollowupNote(updatedText, airtableId, textarea, saveButton, noteElement) {
    console.log(`Lagrer oppfølgingsnotat for ID: ${airtableId}, Ny tekst: ${updatedText}`);

    // Oppdaterer notatet visuelt
    noteElement.textContent = updatedText;

    // Erstatter textarea og lagre-knapp med det oppdaterte notatet
    textarea.replaceWith(noteElement);
    saveButton.remove();

    
}



// Funksjon som håndterer klikk på selskapets navn
function handleCompanyClick(name, airtableId) {
    console.log(`Klikket på selskapet: ${name} (ID: ${airtableId})`);
    companySelected(airtableId, name);
}

// Funksjon som håndterer klikk på oppfølgingsstatus
function handleFollowupStatusClick(name, airtableId) {
    console.log(`Klikket på oppfølgingsstatus for: ${name} (ID: ${airtableId})`);

    const confirmChange = confirm(`Vil du sette oppfølgingsstatus til "Nei" for ${name}?`);
    if (confirmChange) {
        updateFollowupStatus(name, airtableId, "Nei");
    }
}

// Funksjon for å oppdatere oppfølgingsstatus
function updateFollowupStatus(name, airtableId, newStatus) {
    console.log(`Oppdaterer oppfølgingsstatus for: ${name} (ID: ${airtableId}) til ${newStatus}`);
}

// Funksjon for å redigere eller legge til notatet
function editFollowupNote(noteElement, airtableId) {
    const currentText = noteElement.textContent === "Legg til notat" ? "" : noteElement.textContent;
    const textarea = document.createElement("textarea");
    textarea.value = currentText;
    textarea.classList.add("note-editor");

    const saveButton = document.createElement("button");
    saveButton.textContent = "Lagre";
    saveButton.classList.add("save-note-button");

    // Erstatter notatet eller knappen med textarea og lagre-knapp
    noteElement.replaceWith(textarea);
    textarea.after(saveButton);

    textarea.focus();

    // Funksjon for å lagre oppdateringen
    saveButton.addEventListener("click", () => {
        const updatedText = textarea.value;
        saveFollowupNote(updatedText, airtableId, textarea, saveButton, noteElement);
    });
}


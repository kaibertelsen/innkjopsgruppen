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

        const companyNameLabel = rowElement.querySelector(".companynamelable");
        companyNameLabel.textContent = company.Name || "Ukjent";
        companyNameLabel.style.cursor = "pointer";
        companyNameLabel.addEventListener("click", () => {
            handleCompanyClick(company.Name, company.airtable);
        });

        rowElement.querySelector(".winningdate").textContent = company.winningdate || "Ingen dato";
        rowElement.querySelector(".lastfollowingup").textContent = company.lastfollowupdate || "-";
        rowElement.querySelector(".daysagain").textContent = company.daytorenewal || "Ingen data";
        rowElement.querySelector(".rewaldate").textContent = company.nextrenewaldate || "Ingen fornyelsesdato";

        // Legg til notat-knapp rett etter firmanavnet
        const noteButton = document.createElement("button");
        noteButton.classList.add("post-it-button");
        noteButton.title = "Legg til notat";
        noteButton.style.cursor = "pointer";

        if (company.followupnote) {
            noteButton.textContent = "✎";
            noteButton.addEventListener("click", () => {
                editFollowupNote(noteButton, company.airtable, company.followupnote);
            });
        } else {
            noteButton.textContent = "+";
            noteButton.addEventListener("click", () => {
                editFollowupNote(noteButton, company.airtable);
            });
        }

        // Plasserer knappen rett etter firmanavnet
        companyNameLabel.after(noteButton);

        fragment.appendChild(rowElement);
    });

    list.appendChild(fragment);
}

// Funksjon for å redigere eller legge til notatet
function editFollowupNote(noteButton, airtableId, currentText = "") {
    const textarea = document.createElement("textarea");
    textarea.value = currentText;
    textarea.classList.add("note-editor");

    const saveButton = document.createElement("button");
    saveButton.textContent = "Lagre";
    saveButton.classList.add("save-note-button");

    noteButton.replaceWith(textarea);
    textarea.after(saveButton);

    textarea.focus();

    saveButton.addEventListener("click", () => {
        const updatedText = textarea.value;
        saveFollowupNote(updatedText, airtableId, textarea, saveButton, noteButton);
    });
}

// Funksjon for å lagre oppdatert notat
function saveFollowupNote(updatedText, airtableId, textarea, saveButton, noteButton) {
    console.log(`Lagrer oppfølgingsnotat for ID: ${airtableId}, Ny tekst: ${updatedText}`);

    noteButton.textContent = updatedText ? "✎" : "+";
    textarea.replaceWith(noteButton);
    saveButton.remove();

    noteButton.addEventListener("click", () => {
        editFollowupNote(noteButton, airtableId, updatedText);
    });

    const body = {
        followupnote: updatedText
    };

    // Sender oppdateringen til serveren
    PATCHairtable("app1WzN1IxEnVu3m0", "tblFySDb9qVeVVY5c", airtableId, JSON.stringify(body), "responseupdatefollowingUpstatus");
}

// Funksjon for å håndtere klikk på selskapets navn
function handleCompanyClick(name, airtableId) {
    console.log(`Klikket på selskapet: ${name} (ID: ${airtableId})`);
    companySelected(airtableId, name);
}

// Funksjon for å lagre oppdatert notat
function saveFollowupNote(updatedText, airtableId, textarea, saveButton, noteButton) {
    console.log(`Lagrer oppfølgingsnotat for ID: ${airtableId}, Ny tekst: ${updatedText}`);

    // Oppdaterer teksten på knappen basert på om det er et notat eller ikke
    noteButton.textContent = updatedText ? "✎" : "+";

    // Erstatter textarea og fjerner lagre-knappen
    textarea.replaceWith(noteButton);
    saveButton.remove();

    // Fjerner gamle klikkhendelser for å unngå duplikater
    noteButton.replaceWith(noteButton.cloneNode(true));
    const newNoteButton = noteButton.cloneNode(true);
    noteButton.parentNode.replaceChild(newNoteButton, noteButton);

    // Legger til klikkhendelse for å redigere notatet igjen
    newNoteButton.addEventListener("click", () => {
        editFollowupNote(newNoteButton, airtableId, updatedText);
    });

    // Oppretter body-objektet som skal sendes til Airtable
    const body = {
        followupnote: updatedText
    };

    console.log("Body som sendes til Airtable:", body);

    // Sender oppdateringen til serveren
    PATCHairtable("app1WzN1IxEnVu3m0", "tblFySDb9qVeVVY5c", airtableId, JSON.stringify(body), "responseupdateFollowingUpNote");
}


// Funksjon for å oppdatere oppfølgingsstatus
function updateFollowupStatus(name, airtableId, newStatus) {
    console.log(`Oppdaterer oppfølgingsstatus for: ${name} (ID: ${airtableId}) til ${newStatus}`);

    // Sjekker status og setter `nofollowup` til true eller false
    const nofollowup = newStatus.toUpperCase() === "NEI";

    // Oppretter objektet som skal sendes i PATCH-forespørselen
    const body = {
        nofollowup: nofollowup
    };

    // Sender PATCH-forespørsel til Airtable
    PATCHairtable("app1WzN1IxEnVu3m0", "tblFySDb9qVeVVY5c", airtableId, JSON.stringify(body), "responseupdatefollowingUpstatus");
}



function startFollowinglistElement(data) {
    console.log(data);

    const list = document.getElementById("elementfollowinguplist");
    list.replaceChildren();

    const elementLibrary = document.getElementById("elementholderfollowup");
    const nodeElement = elementLibrary.querySelector('.rowelementmanuel');

    if (!nodeElement) {
        console.error("Malen '.rowelementmanuel' ble ikke funnet.");
        return;
    }

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
        rowElement.querySelector(".notetextlable").textContent = company.followupnote || "";

        // Håndterer notat-knappen
        const notebutton = rowElement.querySelector(".notebutton");
        const noteContainer = rowElement.querySelector(".noteholder");
        const savebutton = rowElement.querySelector(".savebutton");
        savebutton.style.display = "none";

        if (company.followupnote) {
            noteContainer.style.display = "block";
            notebutton.style.display = "none";
            /*
            notebutton.addEventListener("click", () => {
                editFollowupNote(rowElement.querySelector(".notetextlable"), company.airtable, company.followupnote);
            });
            */
        } else {
            noteContainer.style.display = "none";
            notebutton.style.display = "inline-block";
            notebutton.addEventListener("click", () => {
                editFollowupNote(noteContainer, company.airtable, "");
            });
        }

        fragment.appendChild(rowElement);
    });

    list.appendChild(fragment);
}

// Funksjon for å redigere eller legge til notatet
function editFollowupNote(noteContainer, airtableId) {
    const textarea = document.createElement("textarea");
    textarea.value = "";
    textarea.placeholder = "Legg til kommentar";
    noteContainer.appendChild(textarea);
    textarea.focus();

    // Legg til eventlistener for når innholdet i textarea endres
    textarea.addEventListener("input", function () {
        handleTextareaChange(textarea.value, airtableId);
    });
}

// Funksjon som håndterer endringer i textarea
function handleTextareaChange(newValue, airtableId) {
    console.log(`Teksten er endret til: ${newValue} for Airtable ID: ${airtableId}`);
    // Legg til logikk for hva som skal gjøres ved endring, f.eks. oppdatere Airtable
}


// Funksjon for å lagre oppdatert notat
function saveFollowupNote(updatedText, airtableId,textlable,textarea) {
    console.log(`Lagrer oppfølgingsnotat for ID: ${airtableId}, Ny tekst: ${updatedText}`);
    textlable.textContent = updatedText;
    textarea.replaceWith(textlable);
    textarea.remove();

    const body = {
        followupnote: updatedText
    };

    console.log("Body som sendes til Airtable:", body);

    PATCHairtable("app1WzN1IxEnVu3m0", "tblFySDb9qVeVVY5c", airtableId, JSON.stringify(body), "responseupdateFollowingUpNote");
}


// Callback-funksjon for oppdatering
function responseupdateFollowingUpNote(data) {
    console.log("Notat oppdatert med respons:", data);
    alert("Notatet ble lagret og oppdatert i Airtable.");
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



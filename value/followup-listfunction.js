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
        const textlable = rowElement.querySelector(".notetextlable");

        textlable.addEventListener("click", () => {
            editFollowupNote(noteContainer, company.airtable);
        });

        savebutton.style.display = "none";

        if (company.followupnote) {
            noteContainer.style.display = "block";
            notebutton.style.display = "none";

            savebutton.addEventListener("click", () => {
                saveFollowupNote(noteContainer, company.airtable);
            });

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



function editFollowupNote(noteContainer, airtableId) {
    // Fjern eksisterende textarea hvis det finnes
    const existingTextarea = noteContainer.querySelector(".textareanote");
    if (existingTextarea) {
        existingTextarea.remove();
    }

    // Opprett og konfigurer textarea
    const textarea = document.createElement("textarea");
    const noteTextLabel = noteContainer.querySelector(".notetextlable");

    if (noteTextLabel && noteTextLabel.textContent !== "") {
        textarea.value = noteTextLabel.textContent;
    }

    textarea.classList.add("textareanote");
    textarea.placeholder = "Legg til en kommentar";
    textarea.focus();

    // Legg textarea som første element i noteContainer
    noteContainer.prepend(textarea);

    // Skjul tekstlabel
    if (noteTextLabel) {
        noteTextLabel.style.display = "none";
    }

    // Sørg for at container er synlig
    noteContainer.style.display = "block";

    // Eventlistener for når innholdet i textarea endres
    textarea.addEventListener("change", function () {
        handleTextareaChange(noteContainer);
    });

    // Eventlistener for sanntidsoppdatering av tekst
    textarea.addEventListener("input", function () {
        textAreaChange(noteTextLabel, textarea);
    });
}


function textAreaChange(notetextlable,textarea){

    notetextlable.textContent = textarea.value;
     //synligjør save knapp
     notetextlable.parentElement.querySelector(".savebutton").style.display = "inline-block";

}


// Funksjon som håndterer endringer i textarea
function handleTextareaChange(noteContainer) {
    //synligjør save knapp
    let notevalue = noteContainer.querySelector(".textareanote").value;
    const notetext = noteContainer.querySelector(".notetextlable");
    notetext.textContent = notevalue;
    notetext.style.display = "block";
    noteContainer.querySelector(".textareanote").remove();
}


// Funksjon for å lagre oppdatert notat
function saveFollowupNote(noteContainer, airtableId) {
   
    const notetext = noteContainer.querySelector(".notetextlable");

    const body = {
        followupnote: notetext.textContent
    };

    console.log("Body som sendes til Airtable:", body);

   // PATCHairtable("app1WzN1IxEnVu3m0", "tblFySDb9qVeVVY5c", airtableId, JSON.stringify(body), "responseupdateFollowingUpNote");
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



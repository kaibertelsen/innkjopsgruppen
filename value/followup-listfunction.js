function startFollowinglistElement(data) {
    listarray = data;
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
    document.getElementById("counterfollowingup").textContent = data.length+" stk.";
    

    data.forEach((company, index) => {
        const rowElement = nodeElement.cloneNode(true);
        rowElement.classList.add("rowlistelement");
        rowElement.id = "row"+"elementfollowinguplist"+company.airtable;
        if (index % 2 === 1) {
            rowElement.classList.add("pair");
        }

        const companyNameLabel = rowElement.querySelector(".companynamelable");
        companyNameLabel.textContent = company.Name || "Ukjent";
        companyNameLabel.style.cursor = "pointer";
        companyNameLabel.addEventListener("click", () => {
            handleCompanyClick(company.Name, company.airtable);
        });

        // Håndterer klikk på "status"-elementet
        const statusElement = rowElement.querySelector(".status");
        statusElement.style.cursor = "pointer";
        statusElement.addEventListener("click", () => {
            const confirmAction = confirm(`Ønsker du å koble selskapet "${company.Name}" fra oppfølging?`);
            if (confirmAction) {
                updateFollowupStatus(statusElement, company.airtable, "NEI");
            }
        });

        
        rowElement.querySelector(".winningdate").textContent = company.winningdate || "Ingen dato";
        rowElement.querySelector(".lastfollowingup").textContent = company.lastfollowupdate || "-";
        rowElement.querySelector(".daysagain").textContent = company.daytorenewal+" dager" || "Ingen data";
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
        savebutton.addEventListener("click", () => {
            saveFollowupNote(noteContainer, company.airtable);
        });

        /*
        if (company.followupnote) {
            noteContainer.style.display = "block";
        } else {
            noteContainer.style.display = "none";
        }
        //her må heller note knappen ha en annen farge
        */
        let clickCount = 0; // Teller for klikk

        notebutton.addEventListener("click", () => {
            clickCount++;
            
            if (clickCount === 1) {
                // Første klikk
                editFollowupNote(noteContainer, company.airtable, "");
            } else if (clickCount === 2) {
                // Andre klikk
                editFollowupNoteClouse(noteContainer);
                clickCount = 0;
            }
        });


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
        handleTextareaChange(noteContainer,airtableId);
    });

    // Eventlistener for sanntidsoppdatering av tekst
    textarea.addEventListener("input", function () {
        textAreaChange(noteTextLabel, textarea);
    });
}

function editFollowupNoteClouse(noteContainer){
    noteContainer.style.display = "none"
}

function textAreaChange(notetextlable,textarea){

    notetextlable.textContent = textarea.value;
     //synligjør save knapp
     notetextlable.parentElement.querySelector(".savebutton").style.display = "inline-block";

}


// Funksjon som håndterer endringer i textarea
function handleTextareaChange(noteContainer,airtableId) {
    //synligjør save knapp
    let notevalue = noteContainer.querySelector(".textareanote").value;
    const notetext = noteContainer.querySelector(".notetextlable");
    notetext.textContent = notevalue;
    notetext.style.display = "block";
    noteContainer.querySelector(".textareanote").remove();
    saveFollowupNote(noteContainer, airtableId);
}


// Funksjon for å lagre oppdatert notat
function saveFollowupNote(noteContainer, airtableId) {
   
    const notetext = noteContainer.querySelector(".notetextlable");
    noteContainer.querySelector(".savebutton").style.display = "none";
    
    const body = {
        followupnote: notetext.textContent
    };

    console.log("Body som sendes til Airtable:", body);

   PATCHairtable("app1WzN1IxEnVu3m0", "tblFySDb9qVeVVY5c", airtableId, JSON.stringify(body), "responseupdateFollowingUpNote");
}


// Callback-funksjon for oppdatering
function responseupdateFollowingUpNote(data) {
    console.log("Notat oppdatert med respons:", data);
}


// Funksjon for å håndtere klikk på selskapets navn
function handleCompanyClick(name, airtableId) {
    companySelected(airtableId, name);
    document.getElementById("besparelsebutton").click();
}



// Funksjon for å oppdatere oppfølgingsstatus
function updateFollowupStatus(statusElement, airtableId, newStatus) {
    statusElement.style.color = "red";
    statusElement.querySelector(".lastfollowingup").textContent = newStatus;

    // Sjekker status og setter `nofollowup` til true eller false
    const nofollowup = newStatus.toUpperCase() === "NEI";

    // Oppretter objektet som skal sendes i PATCH-forespørselen
    const body = {
        nofollowup: nofollowup
    };

    // Sender PATCH-forespørsel til Airtable
    PATCHairtable("app1WzN1IxEnVu3m0", "tblFySDb9qVeVVY5c", airtableId, JSON.stringify(body), "responseupdatefollowingUpstatus");
}



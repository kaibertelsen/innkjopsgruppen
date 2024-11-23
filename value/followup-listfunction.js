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
                createStatusDropdown(rowElement, statusElement, company);
            });

        
        rowElement.querySelector(".winningdate").textContent = company.winningdate || "Ingen dato";
        rowElement.querySelector(".lastfollowingup").textContent = company.lastfollowupdate || "-";
        rowElement.querySelector(".daysagain").textContent = company.daytorenewal+" dager" || "Ingen data";
        rowElement.querySelector(".rewaldate").textContent = company.nextrenewaldate || "Ingen fornyelsesdato";
        
        // Håndterer notat-knappen
        const notebutton = rowElement.querySelector(".notebutton");
        const noteContainer = rowElement.querySelector(".noteholder");
        noteContainer.style.display = "none";

        const savebutton = rowElement.querySelector(".savebutton");
        savebutton.style.display = "none";
        savebutton.addEventListener("click", () => {
            saveFollowupNote(noteContainer, company.airtable);
        });

        const textarea = noteContainer.querySelector(".textareanote");
        textarea.value = company.followupnote || "";

        textarea.addEventListener("change", function () {
            saveFollowupNote(noteContainer, company.airtable);
        });
    
        textarea.addEventListener("input", function () {
            savebutton.style.display = "inline-block";
        });
    
        
        if (company.followupnote) {
            notebutton.style.backgroundImage = "url('https://cdn.prod.website-files.com/6346cf959f8b0bccad5075af/67419b35d007835010a0b68f_note-gul.svg')";
        }
       
        let clickCount = 0; // Teller for klikk
        notebutton.addEventListener("click", () => {
            clickCount++;
            
            if (clickCount === 1) {
                // Første klikk
                noteContainer.style.display = "block";
                adjustTextareaHeight(textarea);
            } else if (clickCount === 2) {
                // Andre klikk
                noteContainer.style.display = "none"
                clickCount = 0;
            }
        });


        fragment.appendChild(rowElement);
    });

    list.appendChild(fragment);
}

function createStatusDropdown(rowElement, statusElement, company) {
    // Fjern eksisterende dropdown hvis den finnes
    const existingDropdown = rowElement.querySelector(".status-dropdown");
    if (existingDropdown) {
        existingDropdown.remove();
        return; // Stopp hvis dropdown allerede var synlig
    }

    // Opprett dropdown-meny
    const dropdown = document.createElement("select");
    dropdown.classList.add("status-dropdown");

    // Legg til alternativer
    const options = [
        { value: "REMOVE", label: "Fjern fra oppfølging" },
        { value: "HIDE", label: "Skjul fra liste" },
        { value: "NORMAL", label: "Normal oppfølging" }
    ];

    options.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option.value;
        opt.textContent = option.label;
        dropdown.appendChild(opt);
    });

    // Legg dropdown til DOM rett under statusElement
    statusElement.parentElement.appendChild(dropdown);

    // Håndter valg
    dropdown.addEventListener("change", () => {
        const selectedValue = dropdown.value;

        if (selectedValue === "REMOVE") {
            const confirmAction = confirm(`Ønsker du å koble selskapet "${company.Name}" fra oppfølging?`);
            if (confirmAction) {
                updateFollowupStatus(statusElement, company.airtable, "NEI");
            }
        } else if (selectedValue === "HIDE") {
            updateFollowupStatus(statusElement, company.airtable, "SKJUL");
        } else if (selectedValue === "NORMAL") {
            updateFollowupStatus(statusElement, company.airtable, "JA");
        }

        // Fjern dropdown etter valg
        dropdown.remove();
    });

    // Stil for dropdown (valgfritt for posisjonering)
    dropdown.style.position = "absolute";
    dropdown.style.zIndex = "1000";
    dropdown.style.marginTop = "5px";
    dropdown.style.padding = "5px";
}



// Funksjon for dynamisk høydejustering
function adjustTextareaHeight(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = (textarea.scrollHeight + 2) + "px";
}


// Funksjon for å lagre oppdatert notat
function saveFollowupNote(noteContainer, airtableId) {
   
    const notetext = noteContainer.querySelector(".textareanote").value;
    noteContainer.querySelector(".savebutton").style.display = "none";
    
    
    const body = {
        followupnote: notetext
    };
   PATCHairtable("app1WzN1IxEnVu3m0", "tblFySDb9qVeVVY5c", airtableId, JSON.stringify(body), "responseupdateFollowingUpNote");

    const notebutton = noteContainer.parentElement.querySelector(".notebutton");
    if(notetext == ""){
        notebutton.click();
        notebutton.style.backgroundImage = "url('https://cdn.prod.website-files.com/6346cf959f8b0bccad5075af/67419b1179e28a2ad73ca8fd_note-gray.svg";
    }else{
        notebutton.style.backgroundImage = "url('https://cdn.prod.website-files.com/6346cf959f8b0bccad5075af/67419b35d007835010a0b68f_note-gul.svg')";
    }
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



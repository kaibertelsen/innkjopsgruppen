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
            const statusElement = rowElement.querySelector(".statusfollowingup");
            statusElement.textContent = company.followupstatus || "Skal følges opp";
            if(company?.followupstatus){
                statusElement.dataset.value = company.followupstatus
                if(company.followupstatus == "HIDE"){
                    statusElement.textContent = "Skjules fra listen";
                    statusElement.style.color = "black";
                }else if (company.followupstatus == "REMOVE"){
                    statusElement.textContent = "Fjernes fra listen";
                    statusElement.style.color = "red";
                }else if (company.followupstatus == "NORMAL"){
                    statusElement.textContent = "Skal følges opp";
                    statusElement.style.color = "green";
                    }
            }else{
                statusElement.dataset.value = "NORMAL"
                statusElement.style.color = "green";
                statusElement.textContent = "Skal følges opp";
            }
            statusElement.style.cursor = "pointer";

            statusElement.addEventListener("click", () => {
                createStatusDropdown(rowElement, statusElement, company);
            });

        
        rowElement.querySelector(".winningdate").textContent = company.winningdate || "Ingen dato";
        rowElement.querySelector(".lastfollowingup").textContent = company.lastfollowupdate || "-";
        rowElement.querySelector(".daysagain").textContent = company.daytorenewal+" dager" || "Ingen data";


        const rewaldate = rowElement.querySelector(".rewaldate");
        rewaldate.textContent = company.nextrenewaldate || "Ingen fornyelsesdato";
        rewaldate.style.cursor = "pointer";

        rewaldate.addEventListener("click", () => {
            handleRewaldateClick(rewaldate, company);
        });


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


function handleRewaldateClick(rewaldate, company) {
    // Skjul rewaldate-teksten midlertidig
    rewaldate.style.display = "none";

    // Opprett dato-inputfelt
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.classList.add("rewaldate-input");
    dateInput.value = company.nextrenewaldate || ""; // Sett eksisterende dato, eller tom
    dateInput.style.width = rewaldate.offsetWidth + "px"; // Sett samme bredde som rewaldate
    dateInput.style.height = rewaldate.offsetHeight + "px"; // Sett samme høyde som rewaldate
    dateInput.style.fontSize = window.getComputedStyle(rewaldate).fontSize; // Match font-størrelse

    // Legg til inputfeltet i stedet for rewaldate
    rewaldate.parentElement.appendChild(dateInput);

    // Sett fokus på inputfeltet
    dateInput.focus();

    // Håndter endring av dato
    dateInput.addEventListener("change", () => {
        company.nextrenewaldate = dateInput.value; // Oppdater selskapets dato
        handleDateChange(company.airtable, dateInput.value); // Kall funksjon for lagring
    });

    // Håndter klikking utenfor feltet
    function handleOutsideClick(event) {
        if (!dateInput.contains(event.target)) {
            rewaldate.style.display = "block"; // Vis rewaldate-teksten igjen
            rewaldate.textContent = company.nextrenewaldate || "Ingen fornyelsesdato"; // Oppdater teksten
            dateInput.remove(); // Fjern inputfeltet
            document.removeEventListener("click", handleOutsideClick); // Fjern eventlistener
        }
    }

    // Legg til eventlistener for å fjerne inputfeltet ved klikk utenfor
    setTimeout(() => {
        document.addEventListener("click", handleOutsideClick);
    }, 0);
}



function handleDateChange(airtableId, newDate) {
    console.log(`Oppdaterer dato for ${airtableId} til ${newDate}`);
    // Legg til logikk for å oppdatere datoen i databasen eller arrayen din

    let body = {
        manuelrewaldate:newDate
    };
    // Sender PATCH-forespørsel til Airtable
    PATCHairtable("app1WzN1IxEnVu3m0", "tblFySDb9qVeVVY5c", airtableId, JSON.stringify(body), "responseupdatefollowingUpstatus");
    //Om den skal skules så kan denne fjernes visuelt

}





function createStatusDropdown(rowElement, statusElement, company) {
    // Sjekk om dropdown allerede finnes
    let dropdown = rowElement.querySelector(".status-dropdown");

    if (!dropdown) {
        // Opprett dropdown-meny
        dropdown = document.createElement("select");
        dropdown.classList.add("status-dropdown");
    
        // Hent den nåværende verdien fra statusElement (dataset.value)
        const currentValue = statusElement.dataset.value;
    
        // Legg til alternativer
        const options = [
            { value: "REMOVE", label: "Fjern fra oppfølging", color: "red" },
            { value: "HIDE", label: "Skjul fra liste", color: "black" },
            { value: "NORMAL", label: "Normal oppfølging", color: "green" }
        ];
    
        options.forEach(option => {
            const opt = document.createElement("option");
            opt.value = option.value;
            opt.textContent = option.label;
            opt.style.color = option.color; // Sett farge for alternativene
    
            // Marker alternativet som valgt hvis verdien matcher
            if (option.value === currentValue) {
                opt.selected = true;
            }
    
            dropdown.appendChild(opt);
        });
    
        // Legg dropdown direkte etter statusElement i samme celle
        statusElement.parentElement.appendChild(dropdown);
    
        // Skjul dropdown som standard
        dropdown.style.display = "none";
    }
    

    // Vis dropdown når brukeren klikker på statusElement
    dropdown.style.display = "inline-block";
    statusElement.style.display = "none"; // Skjul statusElement midlertidig

    // Håndter valg
    dropdown.addEventListener("change", () => {
        const selectedValue = dropdown.value;

        if (selectedValue === "REMOVE") {
            updateFollowupStatus(rowElement,company.airtable, "REMOVE");
            statusElement.textContent = "Fjernes fra listen";
            statusElement.style.color = "red";
        } else if (selectedValue === "HIDE") {
            updateFollowupStatus(rowElement,company.airtable, "HIDE");
            statusElement.textContent = "Skjules fra listen";
            statusElement.style.color = "black";
        } else if (selectedValue === "NORMAL") {
            updateFollowupStatus(rowElement,company.airtable, "NORMAL");
            statusElement.textContent = "Skal følges opp";
            statusElement.style.color = "green";
        }

        // Tilbakestill visningen
        dropdown.style.display = "none"; // Skjul dropdown etter valg
        statusElement.style.display = "inline-block"; // Vis statusElement igjen
    });

    // Håndter klikking utenfor dropdown
    function handleOutsideClick(event) {
        if (!dropdown.contains(event.target) && event.target !== statusElement) {
            dropdown.style.display = "none"; // Skjul dropdown
            statusElement.style.display = "inline-block"; // Vis statusElement igjen
            document.removeEventListener("click", handleOutsideClick); // Fjern eventlistener
        }
    }

    // Legg til eventlistener for å fjerne dropdown ved klikk utenfor
    setTimeout(() => {
        document.addEventListener("click", handleOutsideClick);
    }, 0); // Timeout for å unngå å fange samme klikk som åpnet dropdown
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
function updateFollowupStatus(rowElement,airtableId, newStatus) {
 
    // Oppretter objektet som skal sendes i PATCH-forespørselen
    const body = {
        followupstatus:newStatus
    };

    if(newStatus == "REMOVE"){
        body.nofollowup = true;
    }else{
        body.nofollowup = false;
    }

    // Sender PATCH-forespørsel til Airtable
    PATCHairtable("app1WzN1IxEnVu3m0", "tblFySDb9qVeVVY5c", airtableId, JSON.stringify(body), "responseupdatefollowingUpstatus");
    //Om den skal skules så kan denne fjernes visuelt
    if(newStatus == "HIDE"){
   // rowElement.remove();
    }

}

function responseupdatefollowingUpstatus(data){

    let updateObject = data.fields;
    updateObjectInArray(mainfollowuplist, updateObject.airtable, updateObject);

}

function updateObjectInArray(mainfollowuplist, airtableKey, newData) {
    // Finn objektet som matcher airtableKey
    const objectToUpdate = mainfollowuplist.find(item => item.airtable === airtableKey);

    if (objectToUpdate) {
        // Oppdater objektets egenskaper med de nye dataene
        Object.assign(objectToUpdate, newData);

        // Returner true for å indikere at oppdateringen var vellykket
        return true;
    }

    // Returner false hvis ingen match ble funnet
    return false;
}
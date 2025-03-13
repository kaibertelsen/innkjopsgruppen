var activeNoteConterner = null;
var newNotholder = null;
var activeCompany = null;
var activeNotes = [];

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
            historylog = "followupList";
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

        
            rowElement.querySelector(".winningdate").textContent = company.winningdate 
            ? company.winningdate.split("T")[0] 
            : "Ingen dato";

            rowElement.querySelector(".lastfollowingup").textContent = company.lastfollowupdate 
            ? company.lastfollowupdate.split("T")[0] 
            : "-";

            rowElement.querySelector(".exitdate").textContent = company.exit
            ? company.exit.split("T")[0] 
            : "-";

            rowElement.querySelector(".daysagain").textContent = company.daytorenewal+" dager" || "Ingen data";


        const rewaldate = rowElement.querySelector(".rewaldate");
        rewaldate.textContent = company.nextrenewaldate || "Ingen fornyelsesdato";
        rewaldate.style.cursor = "pointer";

        rewaldate.addEventListener("click", () => {
            handleRewaldateClick(rewaldate, company);
        });



        // Beregn besparelser for de siste 12 månedene
        let abonnementvalue = parseFloat(company.valuegroup) || 0; // Sikrer at dette alltid er et tall
        let savings = 0;

        // Beregn datoen for 12 måneder siden
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

        // Beregn totale besparelser for de siste 12 månedene
        for (let cashflow of company.cashflowjson || []) {
            const maindate = new Date(cashflow.maindate);
            if (maindate >= twelveMonthsAgo) {
                // Bare ta med verdier innenfor de siste 12 månedene
                const cut = parseFloat(cashflow.cut) || 0;
                const bistand = parseFloat(cashflow.bistand) || 0;
                const analyse = parseFloat(cashflow.analyse) || 0;
                savings += cut + bistand + analyse;
            }
        }

        // Oppdater visning av savingsikon
        const savingsicon = rowElement.querySelector(".oversavings");

        if (abonnementvalue > 0 && abonnementvalue <= savings) {
         // Kunden har spart mer enn abonnementverdi, og abonnementverdi er ikke 0
         
        }else{
            savingsicon.classList.add("red");
        }

            savingsicon.style.display = "block";
            
            // Legg til tooltip-funksjonalitet
            savingsicon.addEventListener("mouseover", function () {
                // Sjekk om tooltip allerede eksisterer
                let existingTooltip = savingsicon.parentElement.querySelector(".custom-tooltip");
                if (existingTooltip) return;

                // Opprett tooltip
                let tooltip = document.createElement("div");
                tooltip.className = "custom-tooltip";
                tooltip.textContent = `Besparelse: ${Math.floor(savings)} Kr`;
                tooltip.style.position = "absolute";
                tooltip.style.backgroundColor = "#333";
                tooltip.style.color = "#fff";
                tooltip.style.padding = "5px";
                tooltip.style.borderRadius = "5px";
                tooltip.style.fontSize = "12px";
                tooltip.style.whiteSpace = "nowrap";
                tooltip.style.zIndex = "1000";

                // Plasser tooltip i forhold til parent-elementet
                const parentRect = savingsicon.parentElement.getBoundingClientRect();
                const iconRect = savingsicon.getBoundingClientRect();
                tooltip.style.top = `${iconRect.bottom - parentRect.top + 5}px`; // Plasser under ikonet
                tooltip.style.left = `${iconRect.left - parentRect.left}px`; // Juster horisontalt i forhold til ikonet

                savingsicon.parentElement.appendChild(tooltip);

                savingsicon.addEventListener("mouseleave", function () {
                    tooltip.remove(); // Fjern tooltip når musen forlater ikonet
                });
            });
    
        // Håndterer notat-knappen
        const notebutton = rowElement.querySelector(".notebutton");
        if (company.followupnote) {
            notebutton.style.backgroundImage = "url('https://cdn.prod.website-files.com/6346cf959f8b0bccad5075af/67419b35d007835010a0b68f_note-gul.svg')";
        }

        const noteconteinerlistwrapper = rowElement.querySelector(".noteconteinerlistwrapper");
        
        let clickCount = 0; // Teller for klikk
        notebutton.addEventListener("click", () => {
            clickCount++;
            
            if (clickCount === 1) {
                // Første klikk
                noteconteinerlistwrapper.style.display = "grid";
                //adjustTextareaHeight(textarea);
                getNoteFromServer(company);
                activeNoteConterner = noteconteinerlistwrapper
            } else if (clickCount === 2) {
                // Andre klikk
                noteconteinerlistwrapper.style.display = "none"
                clickCount = 0;
                activeNoteConterner = null;
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
    
    // Legg til inputfeltet i stedet for rewaldate
    rewaldate.parentElement.appendChild(dateInput);

    // Sett fokus på inputfeltet
    dateInput.focus();

   // Håndter endring av dato
    dateInput.addEventListener("change", () => {
        // Oppdater selskapets dato
        company.nextrenewaldate = dateInput.value;

        // Kall funksjon for å lagre og håndtere datoendringen
        handleDateChange(rewaldate, company.airtable, dateInput.value);

        // Formatér datoen til YYYY-MM-DD
        const formattedDate = formatDate(dateInput.value);

        // Vis rewaldate-teksten igjen
        rewaldate.style.display = "inline-block";

        // Oppdater tekstinnholdet i rewaldate med den formaterte datoen eller en standardtekst
        rewaldate.textContent = formattedDate || "Ingen fornyelsesdato";

        // Fjern dato-inputfeltet
        dateInput.remove();
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



function handleDateChange(rewaldate,airtableId, newDate) {
    console.log(`Oppdaterer dato for ${airtableId} til ${newDate}`);
    // Legg til logikk for å oppdatere datoen i databasen eller arrayen din

    let body = {
        manuelrewaldate:newDate
    };
    // Sender PATCH-forespørsel til Airtable
    PATCHairtable("app1WzN1IxEnVu3m0", "tblFySDb9qVeVVY5c", airtableId, JSON.stringify(body), "responseupdatefollowingUpstatus");
    //Om den skal skules så kan denne fjernes visuelt

    //oppdatere dager til denne datoen
    let dayslable = rewaldate.parentElement.parentElement.querySelector(".daysagain");
    dayslable.textContent = calculateDaysUntil(newDate)+" dager";

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

function getNoteFromServer(company) {
    activeCompany = company;
    // Hent notat fra serveren
    body = airtablebodylistAND({companyairtable:company.airtable});
    GetlistairtableNoCache("app1WzN1IxEnVu3m0","tbldHZ9ZDxKlXO8NU",body,"responseNoteFromServer");
}

function responseNoteFromServer(data) { 
    let notes = data.data.map(item => item.fields); // Hent ut notatene fra responsen
    console.log("Notater:", notes);
    

    listNotes(notes,activeCompany);
}

function listNotes(notes,company) {


    //sorter notatene etter dato nyest først
    notes.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });
    


    let noteContainer = activeNoteConterner;
    noteContainer.replaceChildren();


    //fjerne alle notater som ikke inneholder airtable id
    notes = notes.filter(note => note.airtable);
    activeNotes = notes;

    const noteLibrary = document.getElementById("elementholderfollowup");
    const noteElement = noteLibrary.querySelector('.noterowelementcontent');

    if (!noteElement) {
        console.error("Malen '.noteelement' ble ikke funnet.");
        return;
    }

    const fragment = document.createDocumentFragment();

        //lage et forslag til nytt notat
        const newNote = {
            date: new Date().toISOString()
        };
        newNotholder = newNote;
        //legg dette først i listen 
        notes.unshift(newNotholder);

    notes.forEach(note => {
        const noteRow = noteElement.cloneNode(true);
        const noteDate = noteRow.querySelector(".date");
        const noteUsername = noteRow.querySelector(".username");
        const noteText = noteRow.querySelector(".notecontent");
        const deleteButton = noteRow.querySelector(".delete");
        

        //sjekk om dette er et nytt notat, ved å sjekke om det foreligger en airtable id
        if(!note.airtable){
            //det er et nytt notat
            var quill = new Quill(noteText, {
                theme: 'snow', // 'snow' = enkel, 'bubble' = mer minimalistisk
                placeholder: "Skriv notat her..."
            });
           
            quill.root.addEventListener("blur", function() {
                saveNewNote(quill.root.innerHTML,company);
            });

            deleteButton.style.display = "none";
            noteDate.textContent = "Nytt notat";
            noteUsername.textContent = "";

            let noteParent = noteText.parentElement;
            noteParent.style.borderColor = "green";


        }else{

             //Formater dato til 10.mar 2025 eller 10.mar 2025 10:00
            let date = formatDateNote (note.date);
            noteDate.textContent = date;
            noteUsername.textContent = note.username || "Ukjent bruker";
            // Sett HTML-innhold i Quill
            let htmlContent = note.content || "";


            if(userairtableid != note.userairtable){
                //det er ikke denne brukeren som har skrevet dette 
                noteText.innerHTML = htmlContent;   
                deleteButton.style.display = "none";

            }else{
                //det er denne brukeren som har skrevet dette
                deleteButton.style.display = "block";

                var quill = new Quill(noteText, {
                    theme: 'snow' // 'snow' = enkel, 'bubble' = mer minimalistisk
                });
                quill.clipboard.dangerouslyPasteHTML(htmlContent);

                quill.root.addEventListener("blur", function() {
                    saveUpdateNote(quill.root.innerHTML, note.airtable);
                });
                
                deleteButton.addEventListener("click", () => {
                    deleteNoteFromServer(note.airtable);
                    noteRow.remove();
                });
            }
        }    


        fragment.appendChild(noteRow);

    });

    noteContainer.appendChild(fragment);
}
function saveNewNote(note, company) {
    const body = {
        company: [company.airtable],
        content: note,
        user: [userairtableid],
        date: new Date().toISOString() 
    };
    POSTairtable("app1WzN1IxEnVu3m0", "tbldHZ9ZDxKlXO8NU", JSON.stringify(body), "responseNewNote");
}


function responseNewNote(data) {
    console.log("Notat lagret", data);
    //sjekke at det er airtable id
    if(data.id){
        activeNotes.push(data.fields);
        listNotes(activeNotes,activeCompany);
    }
}
function saveUpdateNote(note, airtableId) {
    const body = {
        content: note
    };
    console.log("body",body);
   PATCHairtable("app1WzN1IxEnVu3m0", "tbldHZ9ZDxKlXO8NU", airtableId, JSON.stringify(body), "responseupdateNote");
}


function responseupdateNote(data) {
    console.log("Notat oppdatert", data);
}

function deleteNoteFromServer(airtableId) {
    DELETEairtable("app1WzN1IxEnVu3m0", "tbldHZ9ZDxKlXO8NU", airtableId, "responseDeleteNote");
}

function responseDeleteNote(data) {
    console.log("Notat slettet", data);

    // Fjern notatet fra listen
    activeNotes = activeNotes.filter(note => note.airtable !== data.id);

}

function formatDateNote(isoDate) {
    const months = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
    
    let date = new Date(isoDate);
    
    let day = date.getUTCDate();
    let month = months[date.getUTCMonth()];
    let year = date.getUTCFullYear();
    
    let hours = date.getUTCHours();
    let minutes = date.getUTCMinutes().toString().padStart(2, "0");

    return `${day}.${month} ${year} - ${hours}:${minutes}`;
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
    //synligjør en tilbakeknapp 
    document.getElementById("backbuttonCustomer").style.display = "inline-block";
}

document.getElementById('besparelsebutton').onclick = function() {
    document.getElementById("backbuttonCustomer").style.display = "none";
};

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

    //oppdatert dager og tid
    // Legger til neste fornyelsesdato i arrayet
    mainfollowuplist = addNextRenewalDatetoarray(mainfollowuplist);
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


function calculateDaysUntil(dateString) {
    if (!dateString) return null;

    const today = new Date();
    const targetDate = new Date(dateString);

    if (isNaN(targetDate)) return null; // Returner null hvis datoen er ugyldig

    const timeDifference = targetDate - today;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
}

function formatDate(dateString) {
    if (!dateString) return null; // Returner null hvis datoen er tom

    const date = new Date(dateString);

    if (isNaN(date)) return null; // Returner null hvis datoen er ugyldig

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Legg til ledende null hvis nødvendig
    const day = String(date.getDate()).padStart(2, "0"); // Legg til ledende null hvis nødvendig

    return `${year}-${month}-${day}`;
}

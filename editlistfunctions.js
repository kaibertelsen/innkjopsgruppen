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

        
            rowElement.querySelector(".winningdate").textContent = company.winningdate 
            ? company.winningdate.split("T")[0] 
            : "Ingen dato";

            rowElement.querySelector(".lastfollowingup").textContent = company.lastfollowupdate 
            ? company.lastfollowupdate.split("T")[0] 
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
            savingsicon.src = "https://cdn.prod.website-files.com/6346cf959f8b0bccad5075af/6756b41315622c2bd537c129_savings.png";
        }else{
            savingsicon.src = "https://cdn.prod.website-files.com/6346cf959f8b0bccad5075af/6756b4135d78374d1ff30fd4_no-savings.png";
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

// Legg til en event listener på søkefeltet
document.getElementById("searchcustomer").addEventListener("input", function () {
    const searchQuery = this.value.toLowerCase(); // Hent søketekst og gjør den til små bokstaver
    filterCustomerList(searchQuery); // Kall filterfunksjonen med søketeksten
});
// Filterfunksjon
function filterCustomerList(searchQuery) {
    const filteredData = klientdata.filter(company => {
        // Filtrer basert på om søketeksten finnes i firmaets navn eller organisasjonsnummer
        const nameMatch = company.Name && company.Name.toLowerCase().includes(searchQuery);
        const orgnrMatch = company.orgnr && company.orgnr.toLowerCase().includes(searchQuery);
        return nameMatch || orgnrMatch;
    });

    // Oppdater kundelisten basert på det filtrerte resultatet
    listCustomer(filteredData);
}
// Opprett et input-felt for redigering av tekst
function createInput(currentValue, onSave) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentValue;

    input.addEventListener("blur", () => onSave(input.value));
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") onSave(input.value);
    });

    return input;
}
// Opprett en dropdown (select) for redigering av valg
function createSelect(options, currentValue, onSave) {
    const select = document.createElement("select");

    options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        if (option === currentValue) {
            optionElement.selected = true;
        }
        select.appendChild(optionElement);
    });

    select.addEventListener("blur", () => onSave(select.value));
    select.addEventListener("change", () => onSave(select.value));

    return select;
}

function triggerEditInput(cell, company, field) {
    let currentValue = cell.textContent.trim();

    // Hindre flere input-felt
    if (cell.querySelector("input")) return;

    // Lagre cellens opprinnelige display-verdi
    const originalDisplay = getComputedStyle(cell).display;

    // Opprett input-felt
    const input = document.createElement("input");
    if (field === "valuegroup") {
        input.type = "number";
        currentValue = parseFloat(currentValue.replace(/[^0-9.-]/g, "")) || 0; // Fjern "kr" og formater kun tall
        input.value = currentValue;
        input.style.textAlign = "right"; // Høyrestill teksten
    } else {
        input.type = "text";
        input.value = currentValue;
    }

    // Skjul cellen
    cell.style.display = "none";

    // Legg til input-feltet
    cell.parentElement.appendChild(input);
    input.focus();

    // Lagre endringer ved `blur`
    input.addEventListener("blur", () => {
        let newValue = input.value.trim();

        if (newValue && newValue !== currentValue) {
            let savedata = {};
            if (field === "valuegroup") {
                newValue = parseFloat(newValue) || 0; // Konverter til tallverdi
                cell.textContent = `${newValue.toLocaleString()} kr`;
                savedata[field] = newValue;
            } else {
                cell.textContent = newValue;
                savedata[field] = newValue;
            }
            updateCompanyData(company.airtable, savedata);
        } else {
            // Hvis verdien ikke endres, gjenopprett originalen
            if (field === "valuegroup") {
                cell.textContent = `${parseFloat(currentValue).toLocaleString()} kr`;
            } else {
                cell.textContent = currentValue;
            }
        }

        // Fjern input-feltet og vis cellen med den opprinnelige display-verdi
        input.remove();
        cell.style.display = originalDisplay;
    });

    // Lagre endringer ved `Enter` og avbryt ved `Escape`
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            input.blur(); // Trigger `blur`-hendelsen
        } else if (e.key === "Escape") {
            // Avbryt redigeringen
            input.remove();
            if (field === "valuegroup") {
                cell.textContent = `${parseFloat(currentValue).toLocaleString()} kr`;
            } else {
                cell.textContent = currentValue;
            }
            cell.style.display = originalDisplay;
        }
    });
}

function triggerEditDropdown(cell, company, field, options, onSave) {
    const currentValue = cell.textContent.trim();

    // Hindre flere dropdowns
    if (cell.querySelector("select")) return;

    // Lagre cellens opprinnelige display-verdi
    const originalDisplay = getComputedStyle(cell).display;

    const select = document.createElement("select");

    options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.text;

        if (option.text === currentValue) {
            optionElement.selected = true;
        }
        select.appendChild(optionElement);
    });

    // Skjul cellen
    cell.style.display = "none";

    // Legg til dropdown i foreldre-elementet
    cell.parentElement.appendChild(select);
    select.focus();

    // Lagre endringer ved `blur`
    select.addEventListener("blur", () => {
        const selectedOption = options.find(opt => opt.value.toString() === select.value);

        if (selectedOption && selectedOption.text !== currentValue) {
            onSave(selectedOption);
        } else {
            // Hvis verdien ikke endres, gjenopprett originalen
            cell.textContent = currentValue;
        }

        // Fjern dropdown og vis cellen med den opprinnelige display-verdi
        select.remove();
        cell.style.display = originalDisplay;
    });

    // Håndter tastetrykk (Enter for lagring, Escape for avbryt)
    select.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            select.blur(); // Trigger `blur`-hendelsen
        } else if (e.key === "Escape") {
            // Avbryt redigeringen
            select.remove();
            cell.textContent = currentValue;
            cell.style.display = originalDisplay;
        }
    });
}

function triggerEditDate(cell, company, field) {
    const currentValue = cell.textContent.trim();

    // Forhindre flere input-felt eller knapper
    if (cell.querySelector("input") || cell.querySelector("button")) return;

    // Lagre cellens opprinnelige display-verdi
    const originalDisplay = getComputedStyle(cell).display;

    // Opprett input-felt for dato
    const input = document.createElement("input");
    input.type = "date";
    input.value = currentValue !== "Ingen dato" ? currentValue : "";

    // Opprett knapp for å fjerne dato
    const removeButton = document.createElement("button");
    removeButton.textContent = "Fjern dato";
    removeButton.style.marginLeft = "10px";
    removeButton.style.cursor = "pointer";

    // Skjul cellen
    cell.style.display = "none";

    // Legg til input-felt og knapp
    const parent = cell.parentElement;
    parent.appendChild(input);
    parent.appendChild(removeButton);

    let preventBlur = false; // Variabel for å forhindre blur ved knappetrykk

    // Håndter fjerning av dato
    removeButton.addEventListener("mousedown", () => {
        preventBlur = true; // Hindre `blur` fra input-feltet
    });

    removeButton.addEventListener("click", () => {
        let savedata = {};
        savedata[field] = null; // Sett til null for å fjerne dato
        updateCompanyData(company.airtable, savedata);
        cell.textContent = "Ingen dato"; // Oppdater tekst
        cleanup();
    });

    // Funksjon for å lagre endringer
    const saveDate = newValue => {
        let savedata = {};
        savedata[field] = newValue || null; // Sett til null hvis tom verdi
        updateCompanyData(company.airtable, savedata);
        cell.textContent = newValue ? newValue : "Ingen dato"; // Oppdater tekst
        cleanup();
    };

    // Funksjon for å fjerne elementene
    const cleanup = () => {
        input.remove();
        removeButton.remove();
        cell.style.display = originalDisplay;
    };

    // Håndter lagring ved `blur`
    input.addEventListener("blur", () => {
        setTimeout(() => {
            // Forsikre oss om at knappens `click` kjøres først
            if (preventBlur) {
                preventBlur = false;
                return;
            }

            const newValue = input.value.trim();
            if (newValue !== currentValue) {
                saveDate(newValue);
            } else {
                // Gjenopprett originalen hvis ingen endring
                cell.textContent = currentValue;
                cleanup();
            }
        }, 100); // Kort forsinkelse for å prioritere knappens hendelse
    });

    // Håndter `Enter`-tast
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            input.blur(); // Trigger `blur`-hendelsen
        }
    });

    // Sett fokus på input-feltet
    input.focus();
}

function updateCompanyData(companyId, fieldValue) {

    const company = klientdata.find(item => item.airtable === companyId);

    if (company) {
        // Oppdater lokalt
        let dashboardNeedsUpdate = false; // Sporer om dashboardet trenger oppdatering

        for (const [field, value] of Object.entries(fieldValue)) {
            company[field] = value;

            // Sjekk om dashboardet må oppdateres
            if (field === "valuegroup") {
                dashboardNeedsUpdate = true;
            }else if (field === "gruppe"){
                dashboardNeedsUpdate = true;
            }else if (field === "exit"){
                dashboardNeedsUpdate = true;
            }else if (field === "type"){
                dashboardNeedsUpdate = true;
            }
        }

        // Oppdater dashboard hvis nødvendig
        if (dashboardNeedsUpdate) {
            const dashboardData = calculatingPorteDashboard(klientdata);
            loadDashboardporte(dashboardData);
        }

        // Oppdater på server
        saveToServer(companyId, fieldValue);
  
    } else {
        console.error(`Selskap med ID ${companyId} ikke funnet.`);
    }
}

function saveToServer(companyId, fieldValue) {
    // Lag en kopi av fieldValue for modifikasjon
    const updatedFieldValue = { ...fieldValue };

    // Håndter spesifikke felter
    for (const [field, value] of Object.entries(updatedFieldValue)) {
        if (field === "group") {
            updatedFieldValue["gruppe"] = [value]; // Omdøp "group" til "gruppe"
            delete updatedFieldValue["group"]; // Fjern originalen
        } else if (field === "groupname") {
            delete updatedFieldValue["groupname"]; // Fjern "groupname"
        }
    }

    // Konverter til JSON-streng for sending
    const jsonData = JSON.stringify(updatedFieldValue);
    PATCHairtable(
        "app1WzN1IxEnVu3m0", // App ID
        "tblFySDb9qVeVVY5c", // Tabell ID
        companyId,          // Company ID
        jsonData,           // JSON-data
        "respondcustomerlistupdated" // Callback eller responshåndtering
    );

    console.log(`Oppdatering sendt til server for ID: ${companyId}, Data: ${jsonData}`);
}

function respondcustomerlistupdated(data){
    console.log(data);
}
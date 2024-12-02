document.getElementById("customerlistselector").addEventListener("change", () => {

    //resete søkefelt
    document.getElementById("searchcustomer").value = "";
    listCustomer(klientdata);
});
var activeCustomerlist = [];
function listCustomer(data) {
    const list = document.getElementById("customerlist");
    const selector = document.getElementById("customerlistselector");
    data = filterGroupCompany(data);

    // Filtrer basert på valgt kundegruppe
    let filteredData = data;
    const selectedFilter = selector.value;

    if (selectedFilter === "valuegroup") {
        filteredData = data.filter(company => 
            company.valuegroup && !isNaN(parseFloat(company.valuegroup)) && parseFloat(company.valuegroup) > 0
        );
    } else if (selectedFilter === "kickback") {
        filteredData = data.filter(company =>
            company.cashflowjson && company.cashflowjson.some(cashflow => 
                cashflow.kickbackvalue && parseFloat(cashflow.kickbackvalue) > 0
            )
        );
    }

    // Tømmer listen før oppdatering
    list.replaceChildren();

    const elementLibrary = document.getElementById("customerelementlibrary");
    const nodeElement = elementLibrary.querySelector('.rowcustomer');

    document.getElementById("customerrowcounter").textContent = `${filteredData.length} stk.`;
    activeCustomerlist = filteredData;

    filteredData.forEach((company, index) => {
        const companyElement = nodeElement.cloneNode(true);

        // Legg til "gray"-klasse for første og annenhver element
        if (index % 2 === 0) {
            companyElement.classList.add("gray");
        }

        // Legg til unik ID for selskapet
        companyElement.setAttribute("data-id", company.airtable);

        // Fyll inn verdiene fra `company`-objektet
        const nameCell = companyElement.querySelector(".companynametext");
        const orgnrCell = companyElement.querySelector(".orgnummer");
        const groupCell = companyElement.querySelector(".groupname");
        const kickbackCell = companyElement.querySelector(".kickbakvaluetext");
        const winningDateCell = companyElement.querySelector(".winingdatetext");
        const exitDateCell = companyElement.querySelector(".exitdatetext");
        const invoiceDateCell = companyElement.querySelector(".invoicedatetext");
        const valuegroupCell = companyElement.querySelector(".valutextgroup");

        nameCell.textContent = company.Name || "Ingen navn";
        orgnrCell.textContent = company.orgnr || "Ingen org.nr";
        groupCell.textContent = company.groupname || "Ingen gruppe";

        const totalKickback = company.cashflowjson?.reduce((sum, cashflow) => {
            const value = parseFloat(cashflow.kickbackvalue || 0);
            return sum + (isNaN(value) ? 0 : value);
        }, 0) || 0;

        kickbackCell.textContent = `${Math.round(totalKickback).toLocaleString()} kr`;

        const winningDate = company.winningdate
            ? company.winningdate.split("T")[0]
            : "Ingen dato";
        winningDateCell.textContent = winningDate;

        const invoiceDate = company.invoicedate
        ? company.invoicedate.split("T")[0]
        : "Ingen dato";
        invoiceDateCell.textContent = invoiceDate;

        const exitDate = company.exit
        ? company.invoicedate.split("T")[0]
        : "Ingen dato";
        exitDateCell.textContent = exitDate;

        const valuegroup = company.valuegroup
            ? `${parseFloat(company.valuegroup).toLocaleString()} kr`
            : "0 kr";
        valuegroupCell.textContent = valuegroup;

        // Legg til klikkhendelser for redigering
        nameCell.addEventListener("click", () => triggerEditInput(nameCell, company, "Name"));
        orgnrCell.addEventListener("click", () => triggerEditInput(orgnrCell, company, "orgnr"));
        valuegroupCell.addEventListener("click", () => triggerEditInput(valuegroupCell, company, "valuegroup"));
        /*
        valuegroupCell.addEventListener("click", () => {
            const options = [
                { text: "12.000 kr", value: 12000 },
                { text: "24.000 kr", value: 24000 },
                { text: "36.000 kr", value: 36000 },
                { text: "0 kr", value: 0 },
                {text:"Annet beløp",value:""}
            ];
            triggerEditDropdown(valuegroupCell, company, "valuegroup", options, selectedOption => {
                const updatedValue = selectedOption.value;
                valuegroupCell.textContent = `${updatedValue.toLocaleString()} kr`;
                updateCompanyData(company.airtable, { valuegroup: updatedValue });
            });
        });
        */

    
        
    





        groupCell.addEventListener("click", () => {
            const groupOptions = Array.from(document.getElementById("dashboardgroupselector").options)
            .filter(option => option.value.trim() !== "") // Filtrer ut alternativer med tom value
            .map(option => ({
                value: option.value,
                text: option.text
            }));
        
            triggerEditDropdown(groupCell, company, "group", groupOptions, selectedOption => {
                company.group = selectedOption.value;
                company.groupname = selectedOption.text;
                groupCell.textContent = selectedOption.text;
                updateCompanyData(company.airtable, { group: selectedOption.value, groupname: selectedOption.text });
            });
        });

        winningDateCell.addEventListener("click", () => {
            triggerEditDate(winningDateCell, company, "winningdate");
        });

        invoiceDateCell.addEventListener("click", () => {
            triggerEditDate(invoiceDateCell, company, "invoicedate");
        });

        exitDateCell.addEventListener("click", () => {
            triggerEditDate(exitDateCell, company, "exit");
        });

        list.appendChild(companyElement);
    });
}

function sortDataAlphabetically(data) {
    return data.sort((a, b) => {
        const nameA = a.Name?.toLowerCase() || ""; // Konverter til små bokstaver, fallback til tom streng
        const nameB = b.Name?.toLowerCase() || ""; // Konverter til små bokstaver, fallback til tom streng

        if (nameA < nameB) return -1; // A før B
        if (nameA > nameB) return 1;  // B før A
        return 0; // Lik verdi
    });
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

/*
// Klikk-hendelse for redigering
document.getElementById("customerlist").addEventListener("click", event => {
    const target = event.target;
    const companyElement = target.closest(".rowcustomer");
    const companyId = companyElement.dataset.id; // Anta at hver rad har en data-id med airtable ID
    const company = klientdata.find(item => item.airtable === companyId);

    if (!company) return;

    if (target.classList.contains("orgnummer")) {
        const currentValue = target.textContent;
        const input = createInput(currentValue, newValue => {
            target.textContent = newValue;
            updateCompanyData(klientdata, companyId, "orgnr", newValue);
        });
        target.textContent = "";
        target.appendChild(input);
        input.focus();
    }

    if (target.classList.contains("companynametext")) {
        const currentValue = target.textContent;
        const input = createInput(currentValue, newValue => {
            target.textContent = newValue;
            updateCompanyData(klientdata, companyId, "Name", newValue);
        });
        target.textContent = "";
        target.appendChild(input);
        input.focus();
    }

    if (target.classList.contains("valutextgroup")) {
        const options = ["12000kr", "24000kr", "36000kr", "Annet beløp"];
        const currentValue = target.textContent;
        const select = createSelect(options, currentValue, newValue => {
            if (newValue === "Annet beløp") {
                const input = createInput("", finalValue => {
                    target.textContent = finalValue + " kr";
                    updateCompanyData(klientdata, companyId, "valuegroup", finalValue);
                });
                target.textContent = "";
                target.appendChild(input);
                input.focus();
            } else {
                target.textContent = newValue;
                updateCompanyData(klientdata, companyId, "valuegroup", parseFloat(newValue));
            }
        });
        target.textContent = "";
        target.appendChild(select);
        select.focus();
    }

    if (target.classList.contains("groupname")) {
        const dashboardGroupSelector = document.getElementById("dashboardgroupselector");
        const options = Array.from(dashboardGroupSelector.options).map(option => option.textContent);
        const currentValue = target.textContent;
        const select = createSelect(options, currentValue, newValue => {
            target.textContent = newValue;
            updateCompanyData(klientdata, companyId, "groupname", newValue);
        });
        target.textContent = "";
        target.appendChild(select);
        select.focus();
    }
});
*/

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

    // Simulerer lagring til server
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

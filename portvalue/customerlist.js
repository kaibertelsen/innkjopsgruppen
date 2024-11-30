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
        const valuegroupCell = companyElement.querySelector(".valutextgroup");

        nameCell.textContent = company.Name || "Ingen navn";
        orgnrCell.textContent = company.orgnr || "Ingen org.nr";
        groupCell.textContent = company.groupname || "Ingen gruppe";

        const totalKickback = company.cashflowjson?.reduce((sum, cashflow) => {
            const value = parseFloat(cashflow.kickbackvalue || 0);
            return sum + (isNaN(value) ? 0 : value);
        }, 0) || 0;

        kickbackCell.textContent = `${totalKickback.toLocaleString()} kr`;

        const winningDate = company.winningdate
            ? company.winningdate.split("T")[0]
            : "Ingen dato";
        winningDateCell.textContent = winningDate;

        const valuegroup = company.valuegroup
            ? `${parseFloat(company.valuegroup).toLocaleString()} kr`
            : "0 kr";
        valuegroupCell.textContent = valuegroup;

        // Legg til klikkhendelser for redigering
        nameCell.addEventListener("click", () => triggerEditInput(nameCell, company, "Name"));
        orgnrCell.addEventListener("click", () => triggerEditInput(orgnrCell, company, "orgnr"));
        valuegroupCell.addEventListener("click", () => {
            const options = [
                { text: "12.000 kr", value: 12000 },
                { text: "24.000 kr", value: 24000 },
                { text: "36.000 kr", value: 36000 }
            ];
            triggerEditDropdown(valuegroupCell, company, "valuegroup", options);
        });

        groupCell.addEventListener("click", () => {
            const groupOptions = Array.from(document.getElementById("dashboardgroupselector").options).map(option => ({
                value: option.value,
                text: option.text
            }));
            triggerEditDropdown(groupCell, company, "group", groupOptions, selectedOption => {
                company.group = selectedOption.value;
                company.groupname = selectedOption.text;
                groupCell.textContent = selectedOption.text;
                updateCompanyData(company.airtable, "group", selectedOption.value);
                updateCompanyData(company.airtable, "groupname", selectedOption.text);
            });
        });

        winningDateCell.addEventListener("click", () => {
            triggerEditDate(winningDateCell, company, "winningdate");
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
// Oppdater data lokalt og på serveren
function updateCompanyData(klientdata, companyId, field, newValue) {
    const company = klientdata.find(item => item.airtable === companyId);
    if (company) {
        company[field] = newValue;

        console.log(`Lokalt oppdatert: ${field} = ${newValue} for ID: ${companyId}`);
        
        saveToServer(companyId, field, newValue)
            .then(() => {
                console.log(`Server oppdatert: ${field} = ${newValue} for ID: ${companyId}`);
            })
            .catch(error => {
                console.error("Feil ved oppdatering på serveren:", error);
            });
    } else {
        console.error("Selskap ikke funnet i lokal data:", companyId);
    }
}
// Simuler lagring til server
function saveToServer(companyId, field, newValue) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(`Simulert serveroppdatering for ID: ${companyId}, felt: ${field}, verdi: ${newValue}`);
            resolve({ success: true });
        }, 500);
    });
}
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

function triggerEditInput(cell, company, field) {
    const currentValue = cell.textContent.trim();

    // Hindre flere input-felt
    if (cell.querySelector("input")) return;

    // Lagre cellens opprinnelige display-verdi
    const originalDisplay = getComputedStyle(cell).display;

    const input = document.createElement("input");
    input.type = "text";
    input.value = currentValue;

    // Skjul cellen
    cell.style.display = "none";

    // Legg til input-feltet
    cell.parentElement.appendChild(input);
    input.focus();

    // Lagre endringer ved `blur`
    input.addEventListener("blur", () => {
        const newValue = input.value.trim();

        if (newValue && newValue !== currentValue) {
            cell.textContent = newValue;
            updateCompanyData(company.airtable, field, newValue);
        } else {
            // Hvis verdien ikke endres, gjenopprett originalen
            cell.textContent = currentValue;
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
            cell.textContent = currentValue;
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



function updateCompanyData(companyId, field, newValue) {
    const company = klientdata.find(item => item.airtable === companyId);
    if (company) {
        company[field] = newValue;

        console.log(`Oppdatert lokalt: ${field} = ${newValue}`);
        saveToServer(companyId, field, newValue)
            .then(() => console.log(`Oppdatert på server: ${field} = ${newValue}`))
            .catch(error => console.error("Feil ved oppdatering på server:", error));
    }
}

function triggerEditDate(cell, company, field) {
    const currentValue = cell.textContent.trim();

    // Forhindre flere input-felt
    if (cell.querySelector("input")) return;

    const input = document.createElement("input");
    input.type = "date";
    input.value = currentValue !== "Ingen dato" ? currentValue : "";

    // Lagre den opprinnelige display-verdi for å gjenopprette
    const originalDisplay = getComputedStyle(cell).display;

    // Skjul cellen
    cell.style.display = "none";

    // Legg til input-feltet
    cell.parentElement.appendChild(input);
    input.focus();

    // Lagre endringer ved `blur`
    input.addEventListener("blur", () => {
        const newValue = input.value.trim();

        if (newValue && newValue !== currentValue) {
            cell.textContent = newValue;
            updateCompanyData(company.airtable, field, newValue);
        } else {
            // Hvis verdien ikke endres, gjenopprett originalen
            cell.textContent = currentValue;
        }

        // Fjern input-feltet og vis cellen
        input.remove();
        cell.style.display = originalDisplay;
    });

    // Håndter `Enter`-tast
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") input.blur();
    });
}

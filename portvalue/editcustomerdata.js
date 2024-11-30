

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
    const currentValue = cell.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentValue;

    input.addEventListener("blur", () => {
        const newValue = input.value.trim();
        if (newValue !== currentValue) {
            cell.textContent = newValue;
            updateCompanyData(company.airtable, field, newValue);
        } else {
            cell.textContent = currentValue;
        }
    });

    input.addEventListener("keydown", e => {
        if (e.key === "Enter") input.blur();
    });

    cell.textContent = "";
    cell.appendChild(input);
    input.focus();
}

function triggerEditDropdown(cell, company, field, options) {
    const currentValue = cell.textContent;
    const select = document.createElement("select");

    options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        if (option === currentValue) optionElement.selected = true;
        select.appendChild(optionElement);
    });

    select.addEventListener("blur", () => {
        const newValue = select.value;
        if (newValue !== currentValue) {
            cell.textContent = newValue;
            updateCompanyData(company.airtable, field, newValue);
        } else {
            cell.textContent = currentValue;
        }
    });

    cell.textContent = "";
    cell.appendChild(select);
    select.focus();
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

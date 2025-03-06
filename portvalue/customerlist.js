document.getElementById("customerlistselector").addEventListener("change", () => {

    //resete søkefelt
   // document.getElementById("searchcustomer").value = "";
    listCustomer(klientdata);
});
var activeCustomerlist = [];

document.getElementById("listdateselector").addEventListener("change", () => {

    listCustomer(klientdata);
});


function listCustomer(data) {
    const list = document.getElementById("customerlist");
    const selector = document.getElementById("customerlistselector");
    data = filterGroupCustomerlistCompany(data);

    // Sjekk verdien i tekstfeltet
    let searchField = document.getElementById("searchcustomer");
    let searchValue = searchField ? searchField.value.toLowerCase() : ""; // Søkestreng fra tekstfeltet

    // Filtrer data basert på søkestrengen
    if (searchValue) {
        data = data.filter(company => 
            company.Name.toLowerCase().includes(searchValue)
        );
    }


    // Filtrer basert på valgt kundegruppe
    let filteredData = data;
    const selectedFilter = selector.value;

    let isInDuplicateMode = false;

    if (selectedFilter === "valuegroup") {
        const currentDate = new Date();
    
        filteredData = data.filter(company => {
            // Sjekk om valuegroup er større enn 0
            const hasPositiveValueGroup = company.valuegroup && !isNaN(parseFloat(company.valuegroup)) && parseFloat(company.valuegroup) > 0;
    
            // Sjekk om det ikke finnes en exit-dato eller om exit-datoen er fremtidig
            const noExpiredExitDate = !company.exit || (new Date(company.exit) >= currentDate);
    
            // Inkluder selskapet kun hvis begge kriteriene er oppfylt
            return hasPositiveValueGroup && noExpiredExitDate;
        });
    } else if (selectedFilter === "kickback") {
        filteredData = data.filter(company =>
            company.cashflowjson && company.cashflowjson.some(cashflow => 
                cashflow.kickbackvalue && parseFloat(cashflow.kickbackvalue) > 0
            )
        );
    } else if (selectedFilter === "zero") {
        filteredData = data.filter(company => {
            // Filtrer kunder med valuegroup lik 0
            const isValueGroupZero = ["0", 0, ""].includes(company.valuegroup);

            // Beregn samlet verdi av cashflowjson og sjekk om det er 0
            const totalCashflowValue = company.cashflowjson.reduce((sum, cashflow) => {
                return sum + parseFloat(cashflow.value || "0");
            }, 0);
            const isCashflowZero = totalCashflowValue === 0;
        
            // Returner true hvis begge kriteriene er oppfylt
            return isValueGroupZero && isCashflowZero;
        });
        
    }else if (selectedFilter === "exit") {
        // Hent valgt periode fra listdateselector
        const dateRange = document.getElementById("listdateselector").value.split(",");
        const startDate = new Date(dateRange[0]);
        const endDate = new Date(dateRange[1]);
    
        // Filtrer selskaper basert på exit-dato
        filteredData = data.filter(company => {
            const exitDate = new Date(company.exit);
    
            // Sjekk at exit-feltet eksisterer, er en gyldig dato og innenfor perioden
            return company.exit && !isNaN(exitDate) && exitDate >= startDate && exitDate <= endDate;
        });
    }else if (selectedFilter === "exitRegistered") {
        // Hent valgt periode fra listdateselector
        const dateRange = document.getElementById("listdateselector").value.split(",");
        const startDate = new Date(dateRange[0]);
        const endDate = new Date(dateRange[1]);
    
        // Filtrer selskaper basert på registreringsdato for oppsigelse
        filteredData = data.filter(company => {
            let exitRegisteredAt = company.exitRegisteredAt ? new Date(company.exitRegisteredAt) : new Date(company.exit);
    
            // Sjekk at datoen er gyldig og innenfor valgt periode
            return !isNaN(exitRegisteredAt) && exitRegisteredAt >= startDate && exitRegisteredAt <= endDate;
        });
    }else if (selectedFilter === "duplicate") {
        // Opprett to Maps for å spore duplikater basert på normaliserte navn og orgnr
        const nameMap = new Map();
        const orgnrMap = new Map();
    
        // Trinn 1: Normaliser og grupper selskaper basert på `Name` og `orgnr`
        data.forEach(company => {
            const normalizedName = company.Name.trim().toLowerCase(); // Normaliser navn
            const normalizedOrgnr = company.orgnr.trim(); // Trim orgnr
    
            // Spor selskaper basert på navn
            if (!nameMap.has(normalizedName)) {
                nameMap.set(normalizedName, []);
            }
            nameMap.get(normalizedName).push(company);
    
            // Spor selskaper basert på orgnr (hopp over tomme orgnr)
            if (normalizedOrgnr !== "") {
                if (!orgnrMap.has(normalizedOrgnr)) {
                    orgnrMap.set(normalizedOrgnr, []);
                }
                orgnrMap.get(normalizedOrgnr).push(company);
            }
        });
    
        // Trinn 2: Filtrer selskaper med duplikater (navn, orgnr eller begge deler)
        filteredData = data.filter(company => {
            const normalizedName = company.Name.trim().toLowerCase();
            const normalizedOrgnr = company.orgnr.trim();
    
            const hasDuplicateName = nameMap.get(normalizedName).length > 1;
            const hasDuplicateOrgnr = normalizedOrgnr !== "" && orgnrMap.get(normalizedOrgnr)?.length > 1;
    
            // Inkluder selskaper som har duplikater basert på enten navn eller orgnr
            return hasDuplicateName || hasDuplicateOrgnr;
        });
    
        console.log(filteredData);
        isInDuplicateMode = true;
    }else if (selectedFilter === "freerider"){
        filteredData = data.filter(company => {
            // Sjekk om valuegroup er 0, tom eller "0"
            const isValueGroupZero = ["0", 0, ""].includes(company.valuegroup);
    
            // Sjekk om company.group ikke er i den spesifikke listen av grupper
            const excludedGroups = [
                "recR9wfCUekhlQUHB",
                "recLs5ykxdPBWQWM6",
                "reco7RKbkt82pqE1s",
                "recotgdVqY4St9ZMC"
            ];
            const isNotInExcludedGroups = !excludedGroups.includes(company.group);
    
           
    
            // Returner true hvis alle kriteriene er oppfylt
            return isValueGroupZero && isNotInExcludedGroups;
        });
    }
    

    const dateSelector = document.getElementById("listdateselector");
    let selectedValue = dateSelector.value;
    let [startDate, endDate] = selectedValue.split(",").map(date => new Date(date.trim()));
    
    // Tømmer listen før oppdatering
    list.replaceChildren();

    const elementLibrary = document.getElementById("customerelementlibrary");
    const nodeElement = elementLibrary.querySelector('.rowcustomer');

    document.getElementById("customerrowcounter").textContent = `${filteredData.length} stk.`;
    activeCustomerlist = filteredData;
    let valuecounter = 0;
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
        const typeCell = companyElement.querySelector(".type");
        const kickbackCell = companyElement.querySelector(".kickbakvaluetext");
        const winningDateCell = companyElement.querySelector(".winingdatetext");
        const exitDateCell = companyElement.querySelector(".exitdatetext");
        const exitRegisteredAtCell = companyElement.querySelector(".exitregisteredat");
        const invoiceDateCell = companyElement.querySelector(".invoicedatetext");
        const valuegroupCell = companyElement.querySelector(".valutextgroup");
        const besparelseCell = companyElement.querySelector(".besparelse");
        const altnameCell = companyElement.querySelector(".altname");
        const invoiceintervall = companyElement.querySelector(".invoiceintervall");

        let totals = { value: 0, cut: 0, kickback: 0,bistand:0,analyse:0};
        // Sjekk at cashflowjson eksisterer og er en array
        if (Array.isArray(company.cashflowjson)) {
            // Summer value, cut og kickbackvalue innenfor datoene
            totals = company.cashflowjson.reduce((acc, item) => {
                const mainDate = new Date(item.maindate);
  
                // Sjekk om maindate er innenfor startDate og endDate
                if (
                    (!startDate || mainDate >= startDate) &&
                    (!endDate || mainDate <= endDate)
                ) {
                    acc.value += parseFloat(item.value || 0);
                    acc.cut += parseFloat(item.cut || 0);
                    acc.kickback += parseFloat(item.kickbackvalue || 0);
                    acc.bistand += parseFloat(item.bistand || 0);
                    acc.analyse += parseFloat(item.analyse || 0);
                }
                return acc;
            }, totals);
        } else {
            console.error("cashflowjson is not a valid array.");
        }

        besparelseCell.textContent = Math.round(totals.cut+totals.bistand+totals.analyse) + "kr";

        nameCell.textContent = company.Name || "Ingen navn";
        orgnrCell.textContent = company.orgnr || "Ingen org.nr";
        groupCell.textContent = company.groupname || "Ingen gruppe";
        invoiceintervall.textContent = company.invoiceintervall || "Årlig";
        typeCell.textContent = company.type === "supplier" 
        ? "Leverandør" 
        : company.type === "customer" 
        ? "Kunde" 
        : "Kunde";

        kickbackCell.textContent = `${Math.round(totals.kickback).toLocaleString()} kr`;
        altnameCell.textContent = company.altname || "-"  ;

        const winningDate = company.winningdate
            ? company.winningdate.split("T")[0]
            : "Ingen dato";
        winningDateCell.textContent = winningDate;

        const invoiceDate = company.invoicedate
        ? company.invoicedate.split("T")[0]
        : "Ingen dato";
        invoiceDateCell.textContent = invoiceDate;

        const exitDate = company.exit
        ? company.exit.split("T")[0]
        : "Ingen dato";
        exitDateCell.textContent = exitDate;

        const exitRegisteredAt = company.exitRegisteredAt
        ? company.exitRegisteredAt.split("T")[0]
        : "Ingen dato";
        exitRegisteredAtCell.textContent = exitRegisteredAt;

        const valuegroup = company.valuegroup
            ? `${parseFloat(company.valuegroup).toLocaleString()} kr`
            : "0 kr";
        valuegroupCell.textContent = valuegroup;

        valuecounter +=  Number(company.valuegroup);
        

        // Legg til klikkhendelser for redigering
        nameCell.addEventListener("click", () => triggerEditInput(nameCell, company, "Name"));
        orgnrCell.addEventListener("click", () => triggerEditInput(orgnrCell, company, "orgnr"));
        valuegroupCell.addEventListener("click", () => triggerEditInput(valuegroupCell, company, "valuegroup"));
        altnameCell.addEventListener("click", () => triggerEditInput(altnameCell, company, "altname"));
        

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

        invoiceintervall.addEventListener("click", () => {
            const groupOptions = [
                        {
                        text:"Årlig",
                        value:12
                        },
                        {
                        text:"Halvårlig",
                        value:6
                        },
                        {
                        text:"Kvartalsvis",
                        value:3
                        }
                        ];
                        
    
            triggerEditDropdown(invoiceintervall, company, "invoiceintervall", groupOptions, selectedOption => {
                company.invoiceintervall = selectedOption.value;
                invoiceintervall.textContent = selectedOption.text;
                updateCompanyData(company.airtable, { invoiceintervall: selectedOption.value });
            });
        });

        typeCell.addEventListener("click", () => {
            const groupOptions = [
                        {
                        text:"Kunde",
                        value:"customer"
                        },
                        {
                        text:"Leverandør",
                        value:"supplier"
                        }
                        ];
        
            triggerEditDropdown(typeCell, company, "type", groupOptions, selectedOption => {
                company.type = selectedOption.value;
                typeCell.textContent = selectedOption.text;
                updateCompanyData(company.airtable, { type: selectedOption.value });
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

        exitRegisteredAtCell.addEventListener("click", () => {
            triggerEditDate(exitRegisteredAtCell, company, "exitRegisteredAt");
        });

        const moreinfoDiv = companyElement.querySelector(".moreinfowrapper");
        const moreinfoButton = companyElement.querySelector(".moreinfo");
        
        moreinfoButton.addEventListener("click", () => {
            if (moreinfoDiv.style.height === "0px" || !moreinfoDiv.style.height) {
                // Vis elementet med animasjon
                moreinfoDiv.style.height = `60px`; // Sett høyden til innholdets høyde
                moreinfoDiv.style.overflow = "hidden"; // Skjul eventuell scroll
                moreinfoButton.classList.add("open");
            } else {
                // Skjul elementet med animasjon
                moreinfoDiv.style.height = "0px";
                moreinfoDiv.style.overflow = "hidden"; // Sikre at innhold skjules
                moreinfoButton.classList.remove("open");
            }
        });
        
        // Initial CSS-styling
        moreinfoDiv.style.transition = "height 0.3s ease"; // Legg til animasjon
        moreinfoDiv.style.height = "0px"; // Start med skjult element
        moreinfoDiv.style.overflow = "hidden";



        const deletebutton = companyElement.querySelector(".deletecompanybutton");
        const duplicatebutton = companyElement.querySelector(".duplicatecompanybutton");
        if (isInDuplicateMode) {
            // Sett elementet til duplikatmodus
            deletebutton.style.display = "none";
            duplicatebutton.style.display = "block";
            companyElement.id = company.airtable + "dmode";
        
            duplicatebutton.addEventListener("click", () => {
                // Merk companyElement med blå border
                companyElement.style.border = "2px solid blue";
        
                // Finn duplikat i klientdata-arrayen
                const duplicateCompany = klientdata.find(client => {
                    const normalize = str => (str || "").toLowerCase().trim();

                    const sameName = normalize(client.Name) === normalize(company.Name);

                    // Sjekk at organisasjonsnummer ikke er tomt
                    const sameOrgnr =
                        normalize(client.orgnr) === normalize(company.orgnr) &&
                        normalize(client.orgnr) !== "" &&
                        normalize(company.orgnr) !== "";

                    return (
                        (sameName || sameOrgnr) && // Sjekk om enten navn eller gyldig orgnr matcher
                        client.airtable !== company.airtable // Sikrer at det er en annen instans
                    );
                });

                let duplicateElement = null;
                if (duplicateCompany) {
                    // Merk duplikatens element med blå border
                    duplicateElement = document.getElementById(duplicateCompany.airtable + "dmode");
                    if (duplicateElement) {
                        duplicateElement.style.border = "2px solid blue";
                    }
                }
        
                // Legg til en liten forsinkelse før confirm vises
                setTimeout(() => {
                    const confirmMerge = confirm(
                        duplicateCompany
                            ? `Ønsker du å slå sammen selskapet ${company.Name} (${company.orgnr}) med ${duplicateCompany.Name} (${duplicateCompany.orgnr})?`
                            : "Ingen duplikat funnet for dette selskapet."
                    );
        
                    if (confirmMerge && duplicateCompany) {
                        // Kjør merge-funksjonen hvis brukeren bekrefter
                        try {
                            mergeCompanies(company, duplicateCompany);
                        } catch (error) {
                            console.error("Feil under sammenslåing:", error);
                            alert("Det oppstod en feil under sammenslåing av selskapene.");
                        }
                        companyElement.style.border = "";
                        duplicateElement.style.border = "";      
                    } else {
                        // Fjern merkingen hvis brukeren avbryter eller ingen duplikat finnes
                        companyElement.style.border = "";
                        if (duplicateElement) {
                            duplicateElement.style.border = "";
                        }
                    }
                }, 200); // 200ms forsinkelse
            });
        }
        else{
            //delete company button 
            
                //hvis det er 0 i handel og 0 i abonnement så set en varning på legg til en klasse "warning"
                const isValueGroupZero = ["0", 0, ""].includes(company.valuegroup);
                // Beregn samlet verdi av cashflowjson og sjekk om det er 0
                const totalCashflowValue = company.cashflowjson.reduce((sum, cashflow) => {
                    return sum + parseFloat(cashflow.value || "0");
                }, 0);
                const isCashflowZero = totalCashflowValue === 0;
            if(isValueGroupZero && isCashflowZero){
                deletebutton.addEventListener("click", () => {
                    const confirmation = confirm("Er du sikker på at du vil slette dette selskapet fra portalen?");
                    
                    if (confirmation) {
                        // Hvis brukeren klikker "Ja"
                        deleteCompany(company,companyElement);
        
                    } else {
                        // Hvis brukeren klikker "Nei"
                        console.log("Sletting avbrutt.");
                    }
                });
            }else{
                deletebutton.addEventListener("click", () => {
                    alert("Selskapet har handel, og kan ikke slettes!");
                    /*
                    if (confirmation) {
                        // Hvis brukeren klikker "Ja"
                        deleteCompany(company,companyElement);
        
                    } else {
                        // Hvis brukeren klikker "Nei"
                        console.log("Sletting avbrutt.");
                    }
                    */
                });
            
            }
    }




        // Bruker icon
            const userwrapper = companyElement.querySelector(".usericonwrapper");
            userwrapper.style.display = "none";
            const usercount = companyElement.querySelector(".usercount");

        // Sjekk om det er brukere tilknyttet selskapet
            if (company.bruker.length > 0) {
                // Vis brukerikon og antall brukere
                userwrapper.style.display = "block";
                usercount.textContent = company.bruker.length;

                // Legg til tooltip-funksjonalitet
                userwrapper.addEventListener("mouseover", function () {
                    // Sjekk om tooltip allerede eksisterer
                    let existingTooltip = userwrapper.parentElement.querySelector(".custom-tooltip");
                    if (existingTooltip) return;

                    // Opprett tooltip
                    let tooltip = document.createElement("div");
                    tooltip.className = "custom-tooltip";

                    // Fyll tooltip med navn og e-post
                    company.bruker.forEach(bruker => {
                        const userInfo = document.createElement("div");
                        userInfo.textContent = `${bruker.navn} - ${bruker.epost}`;
                        tooltip.appendChild(userInfo);
                    });

                    // Tooltip-styling
                    tooltip.style.position = "absolute";
                    tooltip.style.backgroundColor = "#333";
                    tooltip.style.color = "#fff";
                    tooltip.style.padding = "5px";
                    tooltip.style.borderRadius = "5px";
                    tooltip.style.fontSize = "12px";
                    tooltip.style.whiteSpace = "nowrap";
                    tooltip.style.zIndex = "1000";
                    tooltip.style.textAlign = "right"; // Høyrestill teksten
                    tooltip.style.visibility = "hidden"; // Skjul for å plassere riktig

                    // Legg tooltip midlertidig til DOM for beregning
                    userwrapper.parentElement.appendChild(tooltip);

                    // Hent bredde og høyde for tooltip
                    const tooltipRect = tooltip.getBoundingClientRect();
                    const iconRect = userwrapper.parentElement.getBoundingClientRect();

                    // Plasser tooltip i samme høyde og 5px til venstre
                    tooltip.style.top = `${10}px`; // Samme høyde som userwrapper
                    tooltip.style.right = `${iconRect.width}px`; // 5px til venstre

                    tooltip.style.visibility = "visible"; // Gjør synlig etter plassering

                    // Fjern tooltip når musen forlater ikonet
                    userwrapper.addEventListener("mouseleave", function () {
                        tooltip.remove();
                    });
                });
            }



     
        

        list.appendChild(companyElement);
    });

    const valuetext = document.getElementById("customerrowvalue");
    if(selectedFilter === "exit" || selectedFilter === "exitRegistered" ){
        valuetext.textContent = `${valuecounter/1000} K. Abonnements verdi`;
        valuetext.style.display = "inline-block"; 
    }else{
        valuetext.style.display = "none"; 
    }
    
    
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

    let company = klientdata.find(item => item.airtable === companyId);

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
                // Sjekk om exitRegisteredAt er satt, hvis ikke, sett den til dagens dato uten klokkeslett
                if (!company.exitRegisteredAt) {
                    let today = new Date();
                    today.setHours(0, 0, 0, 0); // Nullstiller klokkeslettet
                    let date = today.toISOString().split("T")[0]; // Setter kun dato (YYYY-MM-DD)

                    company.exitRegisteredAt = date;
                let exitRegisteredAtObject = {exitRegisteredAt:date}
                //save to server
                saveToServer(companyId, exitRegisteredAtObject);
                }

            }else if (field === "type"){
                dashboardNeedsUpdate = true;
            }else if(field === "exitRegisteredAt"){
                dashboardNeedsUpdate = true;
            }
        }

        // Oppdater dashboard hvis nødvendig
        if (dashboardNeedsUpdate) {
            const dashboardData = calculatingPorteDashboard(klientdata);
            loadDashboardporte(dashboardData);
            const salsboardData = calculatingSaleDashboard(klientdata);
            loadDashboardsale(salsboardData);
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

function deleteCompany(company,companyElement){

    DELETEairtable(
        "app1WzN1IxEnVu3m0", // App ID
        "tblFySDb9qVeVVY5c", // Tabell ID
        company.airtable,
        "companyDeletedResponse"
    );

    // Fjern companyElement fra DOM-en
    companyElement.remove();

}

function companyDeletedResponse(data){
    // Finn indeksen til selskapet som skal slettes i klientdata
    const index = klientdata.findIndex(company => company.airtable === data.id);

    // Hvis selskapet finnes i arrayet, fjern det
    if (index !== -1) {
        klientdata.splice(index, 1);
    } else {
    }
}

function mergeCompanies(company, duplicateCompany) {
    console.log("Sammenslåingen starter");

    // Identifiser hovedselskapet basert på cashflowjson
    let mainCompany, secondaryCompany;

    if (company.cashflowjson.length > 0 && duplicateCompany.cashflowjson.length > 0) {
        alert("Begge selskapene har cashflowjson. Sammenslåingen må da gjøres manuelt.");
        return; // Avslutt funksjonen
    }

    if (company.cashflowjson.length > 0 || duplicateCompany.cashflowjson.length > 0) {
        mainCompany = company.cashflowjson.length > 0 ? company : duplicateCompany;
        secondaryCompany = mainCompany === company ? duplicateCompany : company;
    } else if (company.bruker.length > 0 || duplicateCompany.bruker.length > 0) {
        mainCompany = company.bruker.length >= duplicateCompany.bruker.length ? company : duplicateCompany;
        secondaryCompany = mainCompany === company ? duplicateCompany : company;
    } else if (company.invitasjon.length > 0 || duplicateCompany.invitasjon.length > 0) {
        mainCompany = company.invitasjon.length >= duplicateCompany.invitasjon.length ? company : duplicateCompany;
        secondaryCompany = mainCompany === company ? duplicateCompany : company;
    } else {
        mainCompany = company; // Fallback
        secondaryCompany = duplicateCompany;
    }

    console.log(`Hovedselskap: ${mainCompany.Name}, Orgnr: ${mainCompany.orgnr}`);
    console.log(`Sekundærselskap: ${secondaryCompany.Name}, Orgnr: ${secondaryCompany.orgnr}`);

    // Flytt brukere fra sekundærselskap til hovedselskap
    let usersTransferred = [];
    if (secondaryCompany.bruker && secondaryCompany.bruker.length > 0) {
        usersTransferred = [...secondaryCompany.bruker];
        mainCompany.bruker = [...mainCompany.bruker, ...secondaryCompany.bruker];
        console.log(`Brukere flyttet til hovedselskapet: ${secondaryCompany.bruker.length}`);
    }

    // Flytt invitasjoner fra sekundærselskap til hovedselskap
    let invitationsTransferred = [];
    if (secondaryCompany.invitasjon && secondaryCompany.invitasjon.length > 0) {
        invitationsTransferred = [...secondaryCompany.invitasjon];
        mainCompany.invitasjon = [...mainCompany.invitasjon, ...secondaryCompany.invitasjon];
        console.log(`Invitasjoner flyttet til hovedselskapet: ${secondaryCompany.invitasjon.length}`);
    }

    // Flytt koblinger fra sekundærselskap til hovedselskap
    let connectionsTransferred = [];
    if (secondaryCompany.connection && secondaryCompany.connection.length > 0) {
        connectionsTransferred = [...secondaryCompany.connection];
        mainCompany.connection = [...mainCompany.connection, ...secondaryCompany.connection];
        console.log(`Koblinger flyttet til hovedselskapet: ${secondaryCompany.connection.length}`);
    }

    // Oppdater orgnr hvis hovedselskapet mangler det
    let orgnrTransferred = false;
    if (!mainCompany.orgnr || mainCompany.orgnr.trim() === "") {
        mainCompany.orgnr = secondaryCompany.orgnr || "";
        orgnrTransferred = true;
        console.log(`Hovedselskapets orgnr oppdatert til: ${mainCompany.orgnr}`);
    }

    // Oppdater valuegroup hvis hovedselskapets valuegroup er 0 eller mangler
    let valuegroupTransferred = false;
    if (!mainCompany.valuegroup || mainCompany.valuegroup === "0") {
        mainCompany.valuegroup = secondaryCompany.valuegroup || "0";
        valuegroupTransferred = true;
        console.log(`Hovedselskapets valuegroup oppdatert til: ${mainCompany.valuegroup}`);
    }

    // Oppdater `mainCompany` i `klientdata`
    const mainIndex = klientdata.findIndex(client => client.airtable === mainCompany.airtable);
    if (mainIndex !== -1) {
        klientdata[mainIndex] = mainCompany;
        console.log("Hovedselskapet er oppdatert i klientdata.");
    }

    // Slett `secondaryCompany` fra `klientdata`
    const secondaryIndex = klientdata.findIndex(client => client.airtable === secondaryCompany.airtable);
    if (secondaryIndex !== -1) {
        klientdata.splice(secondaryIndex, 1);
        console.log("Sekundærselskapet er slettet fra klientdata.");
    }

    // Ekstraher brukernes og invitasjonenes airtable-ID-er
    let brukerIds = mainCompany.bruker.map(user => user.airtable);
    let invitasjonIds = mainCompany.invitasjon.map(invitation => invitation.airtable);
    let connectionIds = mainCompany.connection.map(connection => connection.airtable);

    // Fjern duplikater ved å bruke Set
    brukerIds = [...new Set(brukerIds)];
    invitasjonIds = [...new Set(invitasjonIds)];
    connectionIds = [...new Set(connectionIds)];

    // Lag et objekt for lagring
    const saveObject = {
        bruker: brukerIds,
        invitasjon: invitasjonIds,
        connection:connectionIds,
        orgnr: mainCompany.orgnr,
        valuegroup: Number(mainCompany.valuegroup)
    };

    // Send til server oppdatering av main company
    const jsonData = JSON.stringify(saveObject);
    PATCHairtable(
        "app1WzN1IxEnVu3m0", // App ID
        "tblFySDb9qVeVVY5c", // Tabell ID
        mainCompany.airtable,     // Company ID
        jsonData,           // JSON-data
        "respondcustomerlistupdated" // Callback eller responshåndtering
    );

    // Send en slettemelding til server på secondaryCompany
    DELETEairtable(
        "app1WzN1IxEnVu3m0", // App ID
        "tblFySDb9qVeVVY5c", // Tabell ID
        secondaryCompany.airtable,
        "companyDeletedResponse"
    );

    // Fjern secondaryCompany-elementet fra DOM
    const secondaryElement = document.getElementById(secondaryCompany.airtable + "dmode");
    if (secondaryElement) {
        secondaryElement.remove();
        console.log("Sekundærselskapet er fjernet fra listen.");
    }

    // Fjern mainCompanyElement med en fade-out animasjon
    const mainElement = document.getElementById(mainCompany.airtable + "dmode");
    if (mainElement) {
        mainElement.style.transition = "opacity 1s";
        mainElement.style.opacity = "0";
        setTimeout(() => {
            mainElement.remove();
            console.log("Hovedselskapet er fjernet fra listen med en fade-out animasjon.");
        }, 1000); // 1 sekunds animasjon
    }

    // Oppdater dashboard
    const dashboardData = calculatingPorteDashboard(klientdata);
    loadDashboardporte(dashboardData);
    const salsboardData = calculatingSaleDashboard(klientdata);
    loadDashboardsale(salsboardData);

    // Lag en rapport
    const userCount = usersTransferred.length;
    const invitationCount = invitationsTransferred.length;
    const connectionCount = connectionsTransferred.length;
    const valuegroupInfo = valuegroupTransferred ? "Abn. verdi er overført." : "Ingen endring i Abn. verdi.";
    const orgnrInfo = orgnrTransferred ? "Org.nr er overført." : "Ingen endring i Org.nr.";
    const reportMessage = `
        Sammenslåing fullført!
        Brukere overført: ${userCount}
        Invitasjoner overført: ${invitationCount}
        Koblinger overført: ${connectionCount}
        ${valuegroupInfo}
        ${orgnrInfo}
        Sekundærselskap: ${secondaryCompany.Name} (${secondaryCompany.orgnr})
        Hovedselskap: ${mainCompany.Name} (${mainCompany.orgnr})
    `;
    alert(reportMessage.trim());
    console.log(reportMessage.trim());
}


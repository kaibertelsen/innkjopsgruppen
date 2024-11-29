document.getElementById("customerlistselector").addEventListener("change", () => {
    listCustomer(klientdata);
});



function listCustomer(data) {
    const list = document.getElementById("customerlist");
    const selector = document.getElementById("customerlistselector");

    const selectedFilter = selector.value; // Hent valgt verdi fra selectoren
    let filteredData = data;

    // Filtrering basert på valgt verdi
    if (selectedFilter === "valuegroup") {
        // Filtrer kunder som har en verdi i valuegroup
        filteredData = data.filter(company => company.valuegroup && !isNaN(parseFloat(company.valuegroup)));
    } else if (selectedFilter === "kickback") {
        // Filtrer kunder som har minst én kickback-verdi
        filteredData = data.filter(company => {
            return company.cashflowjson && company.cashflowjson.some(cashflow => {
                return cashflow.kickbackvalue && parseFloat(cashflow.kickbackvalue) > 0;
            });
        });
    }

    list.replaceChildren(); // Tømmer holderen for å unngå duplisering

    const elementLibrary = document.getElementById("customerelementlibrary");
    const nodeElement = elementLibrary.querySelector('.rowcustomer');

    document.getElementById("customerrowcounter").textContent = filteredData.length + " stk.";

    filteredData.forEach((company, index) => {
        const companyElement = nodeElement.cloneNode(true);

        // Legg til "gray"-klasse for første og annenhver element
        if (index % 2 === 0) {
            companyElement.classList.add("gray");
        }

        // Fyll inn verdiene fra `company`-objektet
        companyElement.querySelector(".companynametext").textContent = company.Name || "Ingen navn";
        companyElement.querySelector(".orgnummer").textContent = company.orgnr || "Ingen org.nr";
        companyElement.querySelector(".groupname").textContent = company.groupname || "Ingen gruppe";

        // Summer opp alle kickbackvalue
        const totalKickback = company.cashflowjson && company.cashflowjson.length > 0
            ? company.cashflowjson.reduce((sum, cashflow) => {
                const value = parseFloat(cashflow.kickbackvalue || 0);
                return sum + (isNaN(value) ? 0 : value);
            }, 0)
            : 0;

        companyElement.querySelector(".kickbakvaluetext").textContent =
            totalKickback.toLocaleString() + " kr";

        // Format winningdate til "YYYY-MM-DD"
        const winningDate = company.winningdate
            ? company.winningdate.split("T")[0]
            : "Ingen dato";
        companyElement.querySelector(".winingdatetext").textContent = winningDate;

        // Håndter valuegroup
        const valuegroup = company.valuegroup
            ? parseFloat(company.valuegroup).toLocaleString() + " kr"
            : "0 kr";
        companyElement.querySelector(".valutextgroup").textContent = valuegroup;

        // Legg til selskapets element i listen
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


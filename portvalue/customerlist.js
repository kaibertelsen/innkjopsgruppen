
function listCustomer(data) {

    data = sortDataAlphabetically(data);
    document.getElementById("customerrowcounter").textContent = data.length+" stk";

    const list = document.getElementById("customerlist");
    list.replaceChildren(); // Tømmer holderen for å unngå duplisering

    const elementLibrary = document.getElementById("customerelementlibrary");
    const nodeElement = elementLibrary.querySelector('.rowcustomer');

    data.forEach((company, index) => {
        const companyElement = nodeElement.cloneNode(true);

        // Legg til "gray"-klasse for annenhver element
        if (index % 2 === 1) { // Oddetall (index starter fra 0)
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


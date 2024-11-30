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
        // Filtrer kunder med en verdi i valuegroup som ikke er 0
        filteredData = data.filter(company => 
            company.valuegroup && !isNaN(parseFloat(company.valuegroup)) && parseFloat(company.valuegroup) > 0
        );
    } else if (selectedFilter === "kickback") {
        // Filtrer kunder med minst én kickback-verdi som ikke er 0
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
        valuegroupCell.addEventListener("click", () => triggerEditDropdown(valuegroupCell, company, "valuegroup", ["12000kr", "24000kr", "36000kr", "Annet beløp"]));
        groupCell.addEventListener("click", () => {
            const groupOptions = Array.from(document.getElementById("dashboardgroupselector").options).map(option => option.text);
            triggerEditDropdown(groupCell, company, "groupname", groupOptions);
        });

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

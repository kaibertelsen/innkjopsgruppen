function startvaluelist(data, load, sortname, descending) {
    listarray = data;

    // Sorter data alfabetisk basert på "customer"-nøkkelen
    data.sort((a, b) => {
        if (a.customer < b.customer) return descending ? 1 : -1;
        if (a.customer > b.customer) return descending ? -1 : 1;
        return 0;
    });

    const list = document.getElementById("valuelist");
    list.replaceChildren();

    const elementLibrary = document.getElementById("libraryelements");
    const nodeElement = elementLibrary.querySelector('.customerrow');

    document.getElementById("valucustomcounter").textContent = `${data.length} stk.`;

    // Opprett en formatter for NOK valuta
    const formatter = new Intl.NumberFormat('no-NO', {
        style: 'currency',
        currency: 'NOK',
        minimumFractionDigits: 0, // Ingen desimaler
        maximumFractionDigits: 0,
    });

    data.forEach((company, index) => {
        const companyElement = nodeElement.cloneNode(true);

        // Legg til klassen "second" på annenhver element
        if (index % 2 !== 0) {
            companyElement.classList.add("second");
        }

        list.appendChild(companyElement);

        const name = companyElement.querySelector(".customname");
        name.textContent = company.customer;

        const value = companyElement.querySelector(".customvalue");
        value.textContent = formatter.format(company.value);

        const cut = companyElement.querySelector(".customcut");
        cut.textContent = formatter.format(company.cutvalue);

        const kickback = companyElement.querySelector(".cutsomkickback");
        kickback.textContent = formatter.format(company.kickbackvalue);
    });
}

// Legg til søkefunksjon
const searchField = document.getElementById("dropdownval");
document.getElementById("dropdownval").addEventListener("input", () => {
    const searchValue = searchField.value.toLowerCase(); // Konverter til små bokstaver for case-insensitivt søk
    const filteredData = originalData.filter(company =>
        company.customer.toLowerCase().includes(searchValue)
    );
    startvaluelist(filteredData, true); // Sender det filtrerte datasettet til funksjonen
});


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
        value.textContent = company.value;

        const cut = companyElement.querySelector(".customcut");
        cut.textContent = company.cutvalue;

        const kickback = companyElement.querySelector(".cutsomkickback");
        kickback.textContent = company.kickbackvalue;
    });
}


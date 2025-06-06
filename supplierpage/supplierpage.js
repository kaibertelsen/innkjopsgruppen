var GlobalConnections = [];

function getconnections(supplierid){
   let body = airtablebodylistAND({supplierid:supplierid});
    Getlistairtable("app1WzN1IxEnVu3m0","tblLjCOdb9elLmKOb",body,"respondconnections");
}

function respondconnections(data){

    var cleandata = rawdatacleaner(data);

    const cleanedList = cleandata.filter(company => 
        company.company && company.company.length > 0
    );
    
    
    startConnectionList(cleanedList);
    
}

function startConnectionList(data) {
    const list = document.getElementById("listholderconnections");
    if (!list) {
        console.error("List holder element not found");
        return;
    }

    list.replaceChildren(); // Rens listen før ny data legges til

    const elementLibrary = document.getElementById("elementconnectionholder");
    if (!elementLibrary) {
        console.error("Element library not found");
        return;
    }

    const nodeElement = elementLibrary.querySelector('.rowelementnode');
    if (!nodeElement) {
        console.error("Template element not found");
        return;
    }

    // Bruk et sett for å lagre unike kombinasjoner av company[0] + supplier[0]
    const uniqueConnections = new Set();
    const filteredData = [];

    // Fjern duplikater
    data.forEach(connection => {
        const companyId = connection.company?.[0] || "";
        const supplierId = connection.supplier?.[0] || "";
        const uniqueKey = `${companyId}-${supplierId}`;

        if (!uniqueConnections.has(uniqueKey)) {
            uniqueConnections.add(uniqueKey);
            filteredData.push(connection);
        }
    });

    // Oppdater telleren for antall unike tilkoblinger
    document.getElementById("connectioncounter").textContent = filteredData.length + " stk. tilkoblede selskaper.";

    // Sorter data etter `lastmodified` (nyeste først)
    filteredData.sort((a, b) => new Date(b.lastmodified) - new Date(a.lastmodified));

    GlobalConnections = filteredData;
    // Populer listen med unike data
    filteredData.forEach((connection, index) => {
        const rowElement = nodeElement.cloneNode(true);

        // Legg til klasse for annenhver rad (alternating styles)
        if (index % 2 === 1) {
            rowElement.classList.add("pair");
        }

        // Populer raden med data
        rowElement.querySelector(".date").textContent = formatDate(connection.lastmodified) || "Ingen dato";
        rowElement.querySelector(".company").textContent = connection.companyname?.[0] || "";
        rowElement.querySelector(".person").textContent = connection.companybrukernavn?.[0] || "";

        // Legg til rad i listen
        list.appendChild(rowElement);
    });
}

function formatNameList(nameList) {
    if (Array.isArray(nameList)) {
        // Hvis det er en array, returner det første elementet med "..."
        return `${nameList[0].trim()}...`;
    } else if (typeof nameList === "string") {
        // Hvis det er en streng, splitt den på komma
        const names = nameList.split(',');
        return `${names[0].trim()} ...`;
    } else {
        console.error("Expected a string or array, but got:", nameList);
        return "Ukjent...";
    }
}

function formatDate(inputDate) {
    const months = [
        "jan", "feb", "mar", "apr", "mai", "jun",
        "jul", "aug", "sep", "okt", "nov", "des"
    ];

    const date = new Date(inputDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}.${month} ${year}`;
}

document.getElementById("xlsexportbutton").addEventListener("click", () => {
    // Feltene du vil hente
    const selectedFields = ["lastmodified", "companyorgnr", "companyname", "useremail", "companybrukernavn","companyuseremail"];

    // Mapping til nye navn
    const fieldMapping = {
        lastmodified: "Dato",
        companyorgnr: "Orgnummer",
        companyname: "Selskapsnavn",
        useremail: "Innsender",
        companybrukernavn: "Brukere",
        companyuseremail: "Bruker e-poster"
    };

    let filename = "Tilkoblinger for " + GlobalConnections[0].suppliername[0];

    // Eksporter til Excel
    exportData(GlobalConnections, selectedFields, fieldMapping, filename);
});



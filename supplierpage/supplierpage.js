function getconnections(supplierid){
   let body = airtablebodylistAND({supplierid:supplierid,company:0});
    Getlistairtable("app1WzN1IxEnVu3m0","tblLjCOdb9elLmKOb",body,"respondconnections");
}
 var GlobalConnections = [];
function respondconnections(data){

    var cleandata = rawdatacleaner(data);
    GlobalConnections = cleandata;
    startConnectionList(cleandata);
    
}

function startConnectionList(data) {
    const list = document.getElementById("listholderconnections");
    if (!list) {
        console.error("List holder element not found");
        return;
    }

    list.replaceChildren(); // Clear the list container

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

    // Update connection counter
    document.getElementById("connectioncounter").textContent = data.length + " stk. tilkoblede selskaper.";

    // Sort data by lastmodified (newest first)
    data.sort((a, b) => {
        const dateA = new Date(a.lastmodified);
        const dateB = new Date(b.lastmodified);
        return dateB - dateA; // Descending order
    });

    // Populate the list
    data.forEach((connections, index) => {
        const rowElement = nodeElement.cloneNode(true);

        // Add class for alternating row styles
        if (index % 2 === 1) {
            rowElement.classList.add("pair");
        }

        // Populate the row with data
        rowElement.querySelector(".date").textContent = formatDate(connections.lastmodified) || "Ingen dato";
        rowElement.querySelector(".company").textContent = connections.companyname || "";
        rowElement.querySelector(".person").textContent = connections.companybrukernavn || "";
        /*
        // Create a link for the sender element
        const senderElement = rowElement.querySelector(".sender");
        if (senderElement) {
            const emailLink = document.createElement("a");
            emailLink.textContent = connections.brukernavn || "";
            emailLink.href = `mailto:${connections.useremail || ""}`;
            emailLink.target = "_blank"; // Opens email client in a new tab/window
            senderElement.replaceChildren(emailLink);
        }
        */

        // Append the populated row to the list
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
    const selectedFields = ["lastmodified", "companyorgnr", "companyname", "useremail", "companybrukernavn"];

    // Mapping til nye navn
    const fieldMapping = {
        lastmodified: "Dato",
        companyorgnr: "Orgnummer",
        companyname: "Selskapsnavn",
        useremail: "Innsender",
        companybrukernavn: "Brukere"
    };

    let filename = "Tilkoblinger for " + GlobalConnections[0].suppliername[0];

    // Eksporter til Excel
    exportData(GlobalConnections, selectedFields, fieldMapping, filename);
});
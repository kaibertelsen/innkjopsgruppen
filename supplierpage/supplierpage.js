function getconnections(supplierid){
   let body = airtablebodylistAND({supplierid:supplierid});
    Getlistairtable("app1WzN1IxEnVu3m0","tblLjCOdb9elLmKOb",body,"respondconnections");
}
 
function respondconnections(data){

    var cleandata = rawdatacleaner(data);
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

    data.forEach((connections, index) => {
        const rowElement = nodeElement.cloneNode(true);

        // Add class for alternating row styles
        if (index % 2 === 1) {
            rowElement.classList.add("pair");
        }

        // Populate the row with data
        rowElement.querySelector(".date").textContent = connections.lastmodified || "Ingen dato";
        rowElement.querySelector(".company").textContent = connections.companyname || "";
        rowElement.querySelector(".person").textContent = connections.companybrukernavn || "";
        rowElement.querySelector(".status").textContent = "aktiv";

        // Append the populated row to the list
        list.appendChild(rowElement);
    });
}

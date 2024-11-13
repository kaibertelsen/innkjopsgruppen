
//spør etter alle koblinger på dette selskap
function getConnections(companyid) {
    var body = airtablebodylistAND({firmaid:companyid,slettet:0});
    Getlistairtable("app1WzN1IxEnVu3m0","tblLjCOdb9elLmKOb",body,"getConnectionsresponse");
}

function getConnectionsresponse(data){
    
    companyconnection = rawdatacleaner(data);
    console.log(companyconnection);
   // markConnections(companyconnection);
}

function markConnections(connections) {
    // Gå gjennom alle elementer med klassen .merkibj
    document.querySelectorAll('.merkibj').forEach((element) => {
        // Sjekk om elementet har data-supplierid
        const supplierId = element.dataset.supplierid;

        if (!supplierId) {
            console.warn("Elementet mangler data-supplierid:", element);
            return;
        }

        // Sjekk om supplierId finnes i connections-arrayen
        const isConnected = connections.some((connection) => connection.supplierid === supplierId);

        // Sett element.checked til true eller false basert på resultatet
        element.checked = isConnected;
    });
}
 


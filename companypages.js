function startupCode(){
getConnections(airtableCompanyId);
}

//spør etter alle koblinger på dette selskap
function getConnections(data) {
    var body = airtablebodylistAND({firmaid:data,slettet:0});
    Getlistairtable("app1WzN1IxEnVu3m0","tblLjCOdb9elLmKOb",body,"getConnectionsresponse");
}

function getConnectionsresponse(data){
    
    companyconnection = rawdatacleaner(data);
    console.log(companyconnection);
    markConnections(companyconnection);
}

function markConnections(connections) {
    // Gå gjennom alle elementer med klassen .merkibj
    document.querySelectorAll('.merkibj').forEach((element) => {
        // Hent data-supplierid fra elementet
        const supplierId = element.dataset.supplierid;

        if (!supplierId) {
            console.warn("Elementet mangler data-supplierid:", element);
            return;
        }

        // Sjekk om supplierId finnes i noen av supplierid-arrayene i connections
        const isConnected = connections.some((connection) => {
            // Sjekker om supplierid er en array og om den inneholder supplierId
            return Array.isArray(connection.supplierid) && connection.supplierid.includes(supplierId);
        });

        // Log resultatet og eventuelt sett elementet som checked
        //element.checked = isConnected;
        console.log(`Element med supplierId ${supplierId} er koblet:`, isConnected);
    });
}

 


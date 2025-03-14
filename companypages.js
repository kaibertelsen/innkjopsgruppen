document.getElementById("sendconnectionbutton").addEventListener("click", function() {
    // Koden som skal kjøres når knappen trykkes
saveConnections(livecompanyconnection);
});

function startupCode(){
getConnections(airtableCompanyId);
setTimeout(getUserData, 1000);
}

//spør etter alle koblinger på dette selskap
function getConnections(data) {
    var body = airtablebodylistAND({firmaid:data,slettet:0});
    Getlistairtable("app1WzN1IxEnVu3m0","tblLjCOdb9elLmKOb",body,"getConnectionsresponse");
}
var companyconnection;

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
        element.checked = isConnected;
        //console.log(`Element med supplierId ${supplierId} er koblet:`, isConnected);
    });
}

var livecompanyconnection = [];
function updatelivelist(elementid) {
    const element = document.getElementById(elementid);
    const supplierId = element.dataset.supplierid;

    // Sjekk om supplierId er definert
    if (!supplierId) {
        console.warn("Elementet mangler data-supplierid:", element);
        return;
    }

    // Sjekk om supplierId finnes i companyconnection
    const existsInCompanyConnection = companyconnection.some((connection) => {
        return Array.isArray(connection.supplierid) && connection.supplierid.includes(supplierId);
    });

    // Hvis elementet er "checked" (true)
    if (element.checked) {
        // Ikke legg til i livecompanyconnection hvis supplierId allerede finnes i companyconnection
        if (existsInCompanyConnection) {
            return;
        }

        // Sjekk om supplierId allerede finnes i livecompanyconnection
        const existsInLiveConnection = livecompanyconnection.some((connection) => {
            return connection.supplier === supplierId;
        });

        // Legg til i livecompanyconnection hvis det ikke allerede finnes
        if (!existsInLiveConnection) {
            livecompanyconnection.push({
                company: [airtableCompanyId],
                supplier: [supplierId],
                bruker:[myuserID]
            });

        }
    } else {
        // Hvis elementet er "unchecked" (false), fjern objektet fra livecompanyconnection
        livecompanyconnection = livecompanyconnection.filter((connection) => {
            return connection.supplier !== supplierId;
        });
        
    }

}
var multiSaveCount = 0;
function saveConnections(data){
    multiSaveCount = data.length;
    multisave(data,"app1WzN1IxEnVu3m0","tblLjCOdb9elLmKOb","retursaveConnections")
}

function retursaveConnections(data){
    console.log(data);
}

function getUserData(){

    GETairtable("app1WzN1IxEnVu3m0","tblMhgrvy31ihKYbr",myuserID,"respondUserData")
}

function respondUserData(data){
    let userData = data.fields;
    if(!userData.onboarded){
        //det er første gang en logger på

        console.log("Det er første gang en logger på");

        //hvis guid knapp
        document.getElementById("guidestart").click();
        
        //send melding om onboarded
        let body = {onboarded:true};
        PATCHairtable("app1WzN1IxEnVu3m0","tblMhgrvy31ihKYbr",userData.airtableId,JSON.stringify(body),"onboardedregistredresponse");
    }
}

function onboardedregistredresponse(data){
    console.log("Onboarded er registrert");
}

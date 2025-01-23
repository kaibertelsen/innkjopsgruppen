/*
function updateKlientdata(){
    let klientid = "rec1QGUGBMVaqxhp1";
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC",klientid,"updateklientresponse");
}
*/

function downloadKlient(){
    let shareId = "recFvGtz2aJrXSzUa";
    let shareKey = getTokenFromURL("shareKey");
    getRecordWithShareKeyButton(shareId,shareKey,"updateklientresponse");
}

function getTokenFromURL(key){
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get(key); // Henter verdien av 'id'-parameteren
    return id;
   
}


function updateklientresponse(data) {
    // Sjekk om data.fields.membersjson eksisterer og er en array
    if (!data || !data.fields || !data.fields.membersjson || !Array.isArray(data.fields.membersjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields.membersjson' som en array.");
        return;
    }

    // Hent arrayen og konverter JSON-strenger til objekter
    const jsonStrings = data.fields.membersjson;
    const objects = convertJsonStringsToObjects(jsonStrings);
    klientdata = objects;
    loaddSelectors(getUniqueGroups(objects));
    loadSelectorDates();

    loadDashboardporte(calculatingPorteDashboard(objects));
    loadDashboardsale(calculatingSaleDashboard(objects));
    //loadLiquidityOverview(calculateMonthlyValues(objects));
    //listCustomer(objects);

        // Oppdater tidspunkt på tekstelementet "updatedTime"
        const updatedTimeElement = document.getElementById("updatedTime");
        if (updatedTimeElement) {
            const now = new Date();
            const options = { hour: '2-digit', minute: '2-digit', month: 'short', year: 'numeric' };
            const formattedTime = now.toLocaleTimeString('no-NO', options).replace(/\./g, '').replace(':', ':'); // Juster formatering
            const formattedDate = `${formattedTime} - ${now.toLocaleDateString('no-NO', { month: 'short', year: 'numeric' }).replace('.', '')}`;
            updatedTimeElement.textContent = formattedDate;
        } else {
            console.warn("Elementet med ID 'updatedTime' ble ikke funnet.");
        }
    
}
/*
function startAutoUpdate() {
    // Kjør updateKlientdata() umiddelbart
    updateKlientdata();

    // Sett opp et intervall som kjører funksjonen hvert 10. minutt (10 * 60 * 1000 ms)
    setInterval(() => {
        updateKlientdata();
    }, 10 * 60 * 1000);
}
*/


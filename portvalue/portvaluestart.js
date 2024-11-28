
var klientdata = [];

function getKlientdata(){
    let klientid = "rec1QGUGBMVaqxhp1";
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC",klientid,"klientresponse")
}

function klientresponse(data) {
    // Sjekk om data.fields.membersjson eksisterer og er en array
    if (!data || !data.fields || !data.fields.membersjson || !Array.isArray(data.fields.membersjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields.membersjson' som en array.");
        return;
    }

    // Hent arrayen og konverter JSON-strenger til objekter
    const jsonStrings = data.fields.membersjson;
    const objects = convertJsonStringsToObjects(jsonStrings);
    klientdata = objects;
    loadGroupSelector(getUniqueGroups(objects));

    loadDashboard(calculatingPorteDashboard(objects));
    // Gjør noe med objektene om nødvendig
    // Eksempel: objects.forEach(obj => console.log(obj.Name));
}


function calculatingPorteDashboard(objects, monthsBack = 12) {
    const now = new Date(); // Nåværende dato
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack); // Juster cutoff-dato basert på monthsBack

    let sumkickback = 0; // For å summere kickbackvalue innenfor tidsrammen
    let sumvaluegroup = 0; // For å summere valuegroup-verdier

    objects.forEach(obj => {
        // Summér valuegroup hvis det finnes og er et tall
        if (obj.valuegroup) {
            const valuegroupNumber = parseFloat(obj.valuegroup); // Konverter til tall
            if (!isNaN(valuegroupNumber)) {
                sumvaluegroup += valuegroupNumber;
            }
        }

        // Håndter cashflowjson (eller cashflowArray hvis det brukes direkte)
        if (obj.cashflowjson && Array.isArray(obj.cashflowjson)) {
            obj.cashflowjson.forEach(cashflow => {
                if (cashflow.maindate) {
                    const maindate = new Date(cashflow.maindate);

                    // Sjekk om maindate er innenfor tidsrammen
                    if (maindate >= cutoffDate && maindate <= now) {
                        // Summér kickbackvalue hvis det er et tall
                        if (cashflow.kickbackvalue) {
                            const kickbackNumber = parseFloat(cashflow.kickbackvalue); // Konverter til tall
                            if (!isNaN(kickbackNumber)) {
                                sumkickback += kickbackNumber;
                            }
                        }
                    }
                }
            });
        }
    });

    // Returner resultatene
    return {
        sumvaluegroup,
        sumkickback
    };
}

function formatToCurrency(value) {
    if (isNaN(value)) {
        throw new Error("Verdien må være et tall");
    }
    const roundedValue = Math.round(value); // Avrunder til nærmeste heltall
    const formattedValue = roundedValue.toLocaleString('no-NO'); // Legger til tusenskiller i norsk format
    return `${formattedValue} kr`; // Legger til 'kr'
}

function loadDashboard(data){
    let sumkickback = data.sumkickback;
    let sumvaluegroup = data.sumvaluegroup;
    let sumtotal = sumkickback+sumvaluegroup;
    document.getElementById("dachboardportsumtotal").textContent = formatToCurrency(sumtotal);
    document.getElementById("dachboardportkickback").textContent = formatToCurrency(sumkickback);
    document.getElementById("dachboardportvaluegroup").textContent = formatToCurrency(sumvaluegroup);
}

function loadGroupSelector(groups) {
    const selector = document.getElementById("dashboardgroupselector");

    // Tømmer eksisterende alternativer
    selector.innerHTML = "";

    // Sorter gruppene alfabetisk etter groupname
    const sortedGroups = groups.sort((a, b) =>
        a.groupname.localeCompare(b.groupname, 'no', { sensitivity: 'base' })
    );

    // Legg til "Alle"-alternativet øverst
    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "Alle";
    selector.appendChild(allOption);

    // Legg til de sorterte gruppene
    sortedGroups.forEach(group => {
        const option = document.createElement("option");
        option.value = group.group;
        option.textContent = group.groupname;
        selector.appendChild(option);
    });
}









function ruteresponse(data,id){
    if(id == "klientresponse"){
        klientresponse(data);
    }
    
}
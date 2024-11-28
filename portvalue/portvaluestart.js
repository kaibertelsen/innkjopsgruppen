
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

    console.log( calculatingPorteDachboard(objects));

    // Gjør noe med objektene om nødvendig
    // Eksempel: objects.forEach(obj => console.log(obj.Name));
}

function convertJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
        try {
            // Parse hoved JSON-streng til et objekt
            const data = JSON.parse(jsonString);
            if (!data.cashflowjson) {
                data.cashflowjson = [];
            } 

            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
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
    return `${roundedValue} kr`; // Legger til 'kr'
}











function ruteresponse(data,id){
    if(id == "klientresponse"){
        klientresponse(data);
    }
    
}
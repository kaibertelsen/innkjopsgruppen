
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

    console.log( calculatingPorte(objects));

    // Gjør noe med objektene om nødvendig
    // Eksempel: objects.forEach(obj => console.log(obj.Name));
}

function convertJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
        try {
            // Parse hoved JSON-streng til et objekt
            const data = JSON.parse(jsonString);

            // Reparér og håndter `cashflowjson`-feltet
            if (data.cashflowjson) {
                if (typeof data.cashflowjson === "string") {
                    // Hvis cashflowjson er en streng, fiks formatet
                    const repairedCashflow = data.cashflowjson.replace(/}{/g, '},{');
                    data.cashflowArray = JSON.parse(`[${repairedCashflow}]`);
                } else if (Array.isArray(data.cashflowjson)) {
                    // Hvis allerede et gyldig array, kopier direkte
                    data.cashflowArray = data.cashflowjson;
                } else {
                    // Sett til tom array hvis data er ugyldig
                    data.cashflowArray = [];
                }
            } else {
                // Hvis `cashflowjson` ikke finnes, sett til tom array
                data.cashflowArray = [];
            }

            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}



function calculatingPorte(objects, monthsBack = 12) {
    const now = new Date(); // Nåværende dato
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack); // Juster cutoff-dato basert på monthsBack

    let sumkickback = 0; // For å summere kickbackvalue innenfor tidsrammen
    let sumvaluegroup = 0; // For å summere valuegroup-verdier

    objects.forEach(obj => {
        // Summér valuegroup hvis det finnes og er et tall
        if (obj.valuegroup && !isNaN(obj.valuegroup)) {
            sumvaluegroup += parseFloat(obj.valuegroup);
        }

        // Håndter cashflowArray
        if (obj.cashflowArray && Array.isArray(obj.cashflowArray)) {
            obj.cashflowArray.forEach(cashflow => {
                if (cashflow.maindate) {
                    const maindate = new Date(cashflow.maindate);

                    // Sjekk om maindate er innenfor tidsrammen
                    if (maindate >= cutoffDate && maindate <= now) {
                        // Summér kickbackvalue hvis det er et tall
                        if (cashflow.kickbackvalue && !isNaN(cashflow.kickbackvalue)) {
                            sumkickback += parseFloat(cashflow.kickbackvalue);
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
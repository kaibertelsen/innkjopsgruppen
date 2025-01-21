

function downloadcompanyBuffer(){   
	//hente ned alle firma
  //GETairtable(baseid,tableBufferid,"recD8lnmcLc7124f8","respondBuffer");
  let klientid = "rec1QGUGBMVaqxhp1";
  GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC",klientid,"respondBuffer")

}

function respondBuffer(data,id){
//fetchAndParseJSON(data.fields.datafile[0].url);
// Sjekk om data.fields.membersjson eksisterer og er en array
if (!data || !data.fields || !data.fields.membersjson || !Array.isArray(data.fields.membersjson)) {
    console.error("Ugyldig dataformat: Forventet et objekt med 'fields.membersjson' som en array.");
    return;
}

// Hent arrayen og konverter JSON-strenger til objekter
const jsonStrings = data.fields.membersjson;
const objects = convertJsonStringsToObjects(jsonStrings);
console.log(objects);
buffercompanydata = objects;
}

function convertJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
        try {
            // Parse hoved JSON-streng til et objekt
            const data = JSON.parse(jsonString);
            if (!data.cashflowjson) {
                data.cashflowjson = [];
            } 

            if (!data.bruker) {
                data.bruker = [];
            }

            if (!data.invitasjon) {
                data.invitasjon = [];
            }

            if (!data.connections) {
                data.connections = [];
            } 

            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}


/*
// Funksjon for å laste ned og parse JSON-filen
async function fetchAndParseJSON(url) {
    try {
        // Last ned JSON-filen
        const response = await fetch(url);

        // Sjekk om responsen er ok (statuskode 200–299)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        // Parse JSON-filen til et JavaScript-objekt
        const data = await response.json();

        // Logg dataen for å bekrefte at den ble lastet og parsedd riktig
        console.log(data);
        buffercompanydata = data;
        // Du kan nå bruke dataen som et vanlig JavaScript-objekt
        // for eksempel:
        // console.log(data.someProperty);
        
    } catch (error) {
        // Håndter eventuelle feil
        console.error('There was a problem with the fetch operation:', error);
    }
}
*/
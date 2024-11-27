
function getKlientdata(){
    let klientid = "rec1QGUGBMVaqxhp1";
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC",klientid,"klientresponse")
}

function klientresponse(data) {
    if (!data || !data.membersjson || !Array.isArray(data.membersjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'membersjson' som en array.");
        return;
    }

    const objects = convertJsonStringsToObjects(data.membersjson);
    console.log(objects);

    // Gjør noe med objektene om nødvendig
    // Eksempel: objects.forEach(obj => console.log(obj.Name));
}

function convertJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
        try {
            return JSON.parse(jsonString); // Konverter JSON-streng til objekt
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis en streng ikke kan parses
        }
    });
}





function ruteresponse(data,id){
    if(id == "klientresponse"){
        klientresponse(data);
    }
    
}
var companys = [];

function startUp(userid){
    GETairtable("app1WzN1IxEnVu3m0","tblMhgrvy31ihKYbr",userid,"userResponse")
}

function userResponse(data) {
    // Sjekk om data.fields.membersjson eksisterer og er en array
    if (!data || !data.fields || !data.fields.companyjson || !Array.isArray(data.fields.companyjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields.membersjson' som en array.");
    }
//converter data
   const jsonStrings = data.fields.companyjson;
   companys = convertJsonStringsToObjects(jsonStrings);

//loade companyselector og velge startup selskap

    
}
function companyChange(companyId){
// filtrer ut alle leverandører som inneholder en av gruppene som selskapet er i

//list leverandørene

//sorter etter sortnr/ alfabetisk
//send med informasjon om hvilke som alt er knyttet til leverandøren

//sjekk om filter
// søkefelt
//evt. valgte kategorier


}


function ruteresponse(data,id){
    if(id == "userResponse"){
        userResponse(data);
    }
    
}

function convertJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
        try {
            // Parse hoved JSON-streng til et objekt
            const data = JSON.parse(jsonString);
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
function loadInAllCompanyes(){
    let klientid = "rec1QGUGBMVaqxhp1";
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC",klientid,"respondAllCompanyes");
}
  
    

function respondAllCompanyes(data){
        // Sjekk om data.fields.membersjson eksisterer og er en array
        if (!data || !data.fields || !data.fields.membersjson || !Array.isArray(data.fields.membersjson)) {
            console.error("Ugyldig dataformat: Forventet et objekt med 'fields.membersjson' som en array.");
            return;
        }
        // Hent arrayen og konverter JSON-strenger til objekter
        const jsonStrings = data.fields.membersjson;
        const objects = convertJsonStringsToObjects(jsonStrings);

        buffercompanydata = data;
        loadcompany(data);
        
}
var companys = [];

function startUp(userid){
    GETairtable("app1WzN1IxEnVu3m0","tblMhgrvy31ihKYbr",userid,"userResponse")
}

function userResponse(data) {
    // Sjekk om data.fields.companyjson eksisterer og er en array
    if (!data || !data.fields || !data.fields.companyjson || !Array.isArray(data.fields.companyjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields.companyjson' som en array.");
        return; // Avbryt hvis data ikke er gyldig
    }

    // Konverter JSON-strenger til objekter
    const jsonStrings = data.fields.companyjson;
    const companys = convertJsonStringsToObjects(jsonStrings);

    // Hent selector fra DOM
    const selector = document.getElementById("companySelector");
    if (!selector) {
        console.error("Selector med ID 'companySelector' finnes ikke i DOM.");
        return;
    }

    // Last data inn i selector
    loadSelector(selector, companys);

    // Sjekk om favorittselskap eksisterer og velg det, ellers velg første selskap
    if (data.fields?.companystart) {
        const favoriteCompanyId = data.fields.companystart[0];
        const optionToSelect = [...selector.options].find(
            option => option.value === favoriteCompanyId
        );

        if (optionToSelect) {
            selector.value = favoriteCompanyId; // Velger favorittselskapet
        } else {
            console.warn(`Favorittselskapet med ID '${favoriteCompanyId}' finnes ikke i listen.`);
        }
    } else {
        // Velg det første selskapet i listen dersom ingen favorittselskap er angitt
        if (companys.length > 0) {
            selector.value = companys[0]?.airtable; // Sett første element som valgt
        } else {
            console.warn("Ingen selskaper tilgjengelige i listen.");
        }
    }
}


function loadSelector(selector,data){
        // Dynamisk lasting av data i select-feltet
        data.forEach(item => {
          const option = document.createElement("option"); // Lager et option-element
          option.value = item.airtable; // Setter verdien til airtable-ID-en
          option.textContent = item.Name; // Setter tekstinnholdet til Name
          companySelector.appendChild(option); // Legger til option i select-feltet
        });
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
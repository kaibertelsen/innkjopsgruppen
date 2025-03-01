var gsuppliers = [];

function getSuppier(){     
//hente leverandører
GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC","recwnwSGJ0GvRwKFU","supplierResponse");
}

function supplierResponse(data){

   
    if (!data || !data.fields || !data.fields.supplierjson || !Array.isArray(data.fields.supplierjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields.supplierjson' som en array.");
        return; // Avbryt hvis data ikke er gyldig
    }
    // Konverter JSON-strenger til objekter
    const jsonStrings = data.fields.supplierjson;
    suppliers = convertSuppliersJsonStringsToObjects(jsonStrings);
    gsuppliers = suppliers;
    startupSupplierList(suppliers)
}

document.getElementById("searchinput").addEventListener("input", function () {

    // Kjør startupSupplierList med de filtrerte leverandørene
    startupSupplierList(gsuppliers);
});

function startupSupplierList(suppliers){
   // Filtrer leverandørene
   suppliers = filterSuppliers(suppliers);

   // Sorter leverandørene alfabetisk
   suppliers = sortSuppliers(suppliers);

   // List leverandørene i listen
   listSuppliersinList(suppliers)

}

function filterSuppliers(suppliers) {
    // Hent input-feltet
    const searchInput = document.getElementById("searchinput");

    if (!searchInput) {
        console.error("Fant ikke input-feltet med id 'searchinput'");
        return suppliers;
    }

    // Hent søketeksten og trim mellomrom
    const searchText = searchInput.value.trim().toLowerCase();

    // Hvis søketeksten er tom, returner hele listen
    if (searchText === "") {
        return suppliers;
    }

    // Filtrer leverandører basert på søketeksten
    return suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchText)
    );
}

function sortSuppliers(suppliers) {
   
    // Filtrer ut ugyldige eller tomme verdier (valgfritt)
    let filteredSuppliers = suppliers.filter(supplier => supplier.name && supplier.name.trim() !== "");

    // Sorter leverandørene alfabetisk etter navn (case-insensitiv)
    filteredSuppliers.sort((a, b) => a.name.localeCompare(b.name, 'no', { sensitivity: 'base' }));
    return filteredSuppliers;
}

function listSuppliersinList(suppliers){
    console.log(suppliers);
}









function ruteresponse(data,id){

    if(id == "supplierResponse"){
        supplierResponse(data);
    }
}


function convertSuppliersJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
        try {
            // Midlertidig fjern `info`-feltet hvis det finnes
            let infoValue = '';
            if (jsonString.includes('"info":')) {
                // Ekstraher `info`-feltet med en regex (forutsatt korrekt JSON-format)
                const infoMatch = jsonString.match(/"info":\s*"(.*?)"(,|\})/s);
                if (infoMatch) {
                    infoValue = infoMatch[1];  // Ekstraher verdien av `info`
                    jsonString = jsonString.replace(/"info":\s*".*?"(,|\})/s, '"info":""$1');  // Fjern HTML-innholdet midlertidig
                }
            }

            // Parse JSON-strengen uten HTML-dataen
            const data = JSON.parse(jsonString);

            // Legg tilbake `info`-feltet
            data.info = infoValue;

            // Sørg for at "group" og "category" alltid er arrays
            if (!data.group) {
                data.group = [];
            }
            if (!data.category) {
                data.category = [];
            }

            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}
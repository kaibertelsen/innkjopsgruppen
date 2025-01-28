var companys = [];
var suppliers = [];

function startUp(userid){
    GETairtable("app1WzN1IxEnVu3m0","tblMhgrvy31ihKYbr",userid,"userResponse");
}

function userResponse(data) {
    // Sjekk om data.fields.companyjson eksisterer og er en array
    if (!data || !data.fields || !data.fields.companyjson || !Array.isArray(data.fields.companyjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields.companyjson' som en array.");
        return; // Avbryt hvis data ikke er gyldig
    }

    // Konverter JSON-strenger til objekter
    const jsonStrings = data.fields.companyjson;
    companys = convertJsonStringsToObjects(jsonStrings);

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
            selector.value = companys[0].airtable; // Sett første element som valgt
        } else {
            console.warn("Ingen selskaper tilgjengelige i listen.");
        }
    }


    //hente leverandører
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC","recwnwSGJ0GvRwKFU","supplierResponse");
}

function loadSelector(selector,data){
        selector.innerHTML = ''; 
        // Dynamisk lasting av data i select-feltet
        data.forEach(item => {
          const option = document.createElement("option"); // Lager et option-element
          option.value = item.airtable; // Setter verdien til airtable-ID-en
          option.textContent = item.Name; // Setter tekstinnholdet til Name
          companySelector.appendChild(option); // Legger til option i select-feltet
        });
}

document.getElementById("companySelector").addEventListener("change", function () {
    // Hent verdien og teksten til det valgte alternativet
    const selector = document.getElementById("companySelector");
    const selectedValue = selector.value; // ID (airtable)
    const selectedText = selector.options[selector.selectedIndex].text; // Navn
    companyChange(selectedValue);
});

function supplierResponse(data){
    // Sjekk om data.fields.companyjson eksisterer og er en array
        if (!data || !data.fields || !data.fields.supplierjson || !Array.isArray(data.fields.supplierjson)) {
            console.error("Ugyldig dataformat: Forventet et objekt med 'fields.companyjson' som en array.");
            return; // Avbryt hvis data ikke er gyldig
        }
        // Konverter JSON-strenger til objekter
        const jsonStrings = data.fields.supplierjson;
        suppliers = convertSuppliersJsonStringsToObjects(jsonStrings);
        suppliersReady();
    
}

function suppliersReady(){
    const selector = document.getElementById("companySelector");
    companyChange(selector.value);
}

function companyChange(companyId) {
    console.log("List på bakgrunn av dette selskapet: " + companyId);

    // Finn selskapet basert på ID
    const selectedCompany = companys.find(company => company.airtable === companyId);

    if (!selectedCompany) {
        console.error("Fant ikke selskap med ID: " + companyId);
        return;
    }

    console.log("Valgt selskap:", selectedCompany);

    // Filtrer leverandører basert på gruppetilhørighet
    const filteredSuppliers = suppliers.filter(supplier => {
        return supplier.group.some(group => group.airtable === selectedCompany.group);
    });

    console.log("Filtrerte leverandører:", filteredSuppliers);

    // Videre logikk for hva du ønsker å gjøre med de filtrerte leverandørene
    // F.eks. oppdatere en visning eller kalle en annen funksjon
    activeSupplierList = filteredSuppliers;
    listSuppliers(activeSupplierList);
}

// Lytt til 'input'-hendelsen på søkefeltet
document.getElementById("searchinput").addEventListener("input", () => {
    // Kjør funksjonen med den aktive leverandørlisten
    listSuppliers(activeSupplierList);
});

function listSuppliers(data) {
    console.log(data);

    const supplierContainer = document.getElementById("supplierlist");
    if (!supplierContainer) {
        console.error("Ingen container funnet for visning av leverandører.");
        return;
    }

    // Hent søkeverdien fra søkefeltet
    const searchInput = document.getElementById("searchinput");
    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';

    // Filtrer data basert på "name" som matcher søkeverdien
    let filteredData = data.filter(supplier =>
        supplier.name.toLowerCase().includes(searchValue)
    );

    // Sorter data først etter "sortering" (konvertert til tall) og deretter alfabetisk etter "name"
    filteredData.sort((a, b) => {
        // Håndter sortnr for både tomme strenger og manglende verdier
        const sortNrA = a.sortering !== undefined && a.sortering !== "" ? Number(a.sortering) : 1000; 
        const sortNrB = b.sortering !== undefined && b.sortering !== "" ? Number(b.sortering) : 1000;
    
        // Sorter etter sortnr først
        if (sortNrA !== sortNrB) {
            return sortNrA - sortNrB;
        }
    
        // Hvis sortnr er lik, sorter alfabetisk etter navn
        return a.name.localeCompare(b.name);
    });

    // Tøm container
    supplierContainer.innerHTML = '';

    const elementLibrary = document.getElementById("elementlibrary");
    if (!elementLibrary) {
        console.error("Ingen 'elementlibrary' funnet.");
        return;
    }

    const nodeElement = elementLibrary.querySelector('.suppliercard');
    if (!nodeElement) {
        console.error("Ingen '.suppliercard' funnet i 'elementlibrary'.");
        return;
    }

    // Oppdater med nye leverandører
    filteredData.forEach(supplier => {
        const supplierElement = nodeElement.cloneNode(true);

        // Sett navn
        const name = supplierElement.querySelector('.suppliername');
        if (name) name.textContent = supplier.name || "Ukjent navn";

        // Sett kortinfo
        const shortinfo = supplierElement.querySelector('.shortinfo');
        if (shortinfo) shortinfo.textContent = supplier.kortinfo || "Ingen informasjon tilgjengelig";

        // Sett kategori
        const kategori = supplierElement.querySelector('.kategori');
        if (kategori) kategori.textContent = supplier.kategori || "-";

        // Sett logo
        const logo = supplierElement.querySelector('.logoelement');
        if (logo) {
            if (supplier.logo) {
                logo.src = supplier.logo;
            } else {
                logo.src = "path/to/default/logo.png"; // Standardbilde hvis logo mangler
            }
        }

        // Legg til leverandøren i containeren
        supplierContainer.appendChild(supplierElement);
    });
}







function ruteresponse(data,id){
    if(id == "userResponse"){
        userResponse(data);
    }else if(id == "supplierResponse"){
        supplierResponse(data);
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

function convertSuppliersJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
        try {
           
           // Parse hoved JSON-streng til et objekt
           const data = JSON.parse(jsonString);
           if (!data.group) {
               data.group = [];
           } 
            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}





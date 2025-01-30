var companys = [];
var userid;
var suppliers = [];
let currentFlippedElement = null;
var activeCompany = {};
var mainlistElementClass = ".suppliercard";


document.getElementById("elementlibrary").style.display = "none";

function startUp(userid){
    GETairtable("app1WzN1IxEnVu3m0","tblMhgrvy31ihKYbr",userid,"userResponse");
}

function userResponse(data) {
    // Sjekk om data.fields.companyjson eksisterer og er en array
    if (!data || !data.fields || !data.fields.companyjson || !Array.isArray(data.fields.companyjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields.companyjson' som en array.");
        return; // Avbryt hvis data ikke er gyldig
    }

    if (data.fields?.onboarded && data.fields.onboarded === true) {
        // Brukeren er allerede onboarded
        console.log("Brukeren er allerede onboarded.");
    } else {
        // Brukeren er ikke onboarded, fortsett med onboarding-prosessen
        document.getElementById("tabwelcome").click();
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

function registrerOnboarded(){
    let body = {onboarded:true};
    patchAirtable("app1WzN1IxEnVu3m0","tblMhgrvy31ihKYbr",userid,JSON.stringify(body),"responsOnboarded")
}

function responsOnboarded(data){
    console.log(data);
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

        // Filtrer vekk alle suppliers som har true i nøkelen "hidden"
        suppliers = suppliers.filter(supplier => !supplier.hidden);

        //hent ut alle unike kategorier og legg disse kategorier i en array
        categories = getuniqueCategories(suppliers);
        // Kall funksjonen som gjør klar leverandørene for videre behandling
        suppliersReady();
    
}

function getuniqueCategories(suppliers){

        // Hent ut alle unike kategorier fra suppliers
        let uniqueCategories = new Set();
        suppliers.forEach(supplier => {
            if (Array.isArray(supplier.category)) {
                supplier.category.forEach(cat => uniqueCategories.add(cat));
            }
        });
    
        // Konverter Set til array
        uniqueCategories = Array.from(uniqueCategories);
        return uniqueCategories;
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

    activeCompany = selectedCompany;

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

    // Sjekk om filteret er aktivt mine avtaler hvis aktiv
    const hasActiveDeals = document.getElementById("filtermydealsbutton").classList.contains("active");
    if (hasActiveDeals) {
        // Hent alle supplier-verdiene fra activeCompany.connection
        const activeSuppliers = activeCompany.connection.map(conn => conn.supplier);

        // Filtrer arrayen basert på matching i "airtable"-nøkkelen
        filteredData = filteredData.filter(item => activeSuppliers.includes(item.airtable));
    }

    // Sorter data først etter "sortering" (konvertert til tall) og deretter alfabetisk etter "name"
    filteredData.sort((a, b) => {
        // Konverter 'sortering' til tall, eller sett en lav verdi for manglende eller tomme verdier
        const sortNrA = a.sortering !== undefined && a.sortering !== "" ? Number(a.sortering) : -Infinity;
        const sortNrB = b.sortering !== undefined && b.sortering !== "" ? Number(b.sortering) : -Infinity;
    
        // Sorter først etter sortnr i synkende rekkefølge (høyest nummer først)
        if (sortNrA !== sortNrB) {
            return sortNrB - sortNrA;
        }
    
        // Hvis sortnr er lik (eller begge mangler), sorter alfabetisk etter 'name'
        return a.name.localeCompare(b.name);
    });
    

    // Tøm container
    supplierContainer.innerHTML = '';

    const elementLibrary = document.getElementById("elementlibrary");
    if (!elementLibrary) {
        console.error("Ingen 'elementlibrary' funnet.");
        return;
    }

    const nodeElement = elementLibrary.querySelector(mainlistElementClass);
    if (!nodeElement) {
        console.error("Ingen '.suppliercard' funnet i 'elementlibrary'.");
        return;
    }

    //sette counter
    let textmesage = " stk.";
    if(hasActiveDeals){
        textmesage = " stk. (Viser nå tilknyttede leverandører for selskapet "+activeCompany.Name+" )";
    }
    const counter = document.getElementById("counterlist");
    counter.textContent = filteredData.length+textmesage;
    counter.style.display = "block";
    
  // Oppdater med nye leverandører
    filteredData.forEach(supplier => {
        const supplierElement = nodeElement.cloneNode(true);

        // Legg til en 'rotasjonstilstand' for å spore om elementet er rotert
        let isFlipped = false;

        // Synlighet og rotasjon for forside og bakside
        const front = supplierElement.querySelector('.forside');
        const back = supplierElement.querySelector('.baksiden');
        const connectorwrapper = supplierElement.querySelector('.connectorwrapper');

        if (!front || !back) {
            //
            return;
        }

            // Initialiser transform og synlighet
            supplierElement.style.transformStyle = "preserve-3d";
            supplierElement.style.perspective = "1000px"; // For å skape 3D-effekt
            supplierElement.style.transition = "transform 0.5s ease-in-out";
            back.style.transform = "rotateY(180deg)"; // Roter baksiden 180 grader for riktig orientering
            front.style.display = "block";
            back.style.display = "none";

            // Klikk-hendelse for rotasjon
            function toggleFlip() {
                if (!isFlipped) {
                    // Rotasjon og visning av baksiden
                    supplierElement.style.transform = "rotateY(180deg)";

                    // Forsinkelse for å bytte synlighet midt i animasjonen
                    setTimeout(() => {
                        front.style.display = "none";
                        connectorwrapper.style.display = "none";
                        back.style.display = "block";
                    }, 250); // Halvveis gjennom animasjonen
                } else {
                    // Rotasjon og visning av forsiden
                    supplierElement.style.transform = "rotateY(0deg)";

                    // Forsinkelse for å bytte synlighet midt i animasjonen
                    setTimeout(() => {
                        back.style.display = "none";
                        front.style.display = "block";
                        connectorwrapper.style.display = "block";
                    }, 250); // Halvveis gjennom animasjonen
                }

                // Bytt tilstand
                isFlipped = !isFlipped;
            }

            // Legg til klikk-hendelser for både forsiden og baksiden
            front.addEventListener('click', toggleFlip);
            back.addEventListener('click', toggleFlip);
        
       // Finn checkbox-elementet
        const merkibjCheckbox = supplierElement.querySelector(".merkibj");

        // Sjekk om noen av objektene i selectedCompany.connection har en "supplier" som matcher supplier.airtable
        if (activeCompany.connection.some(conn => conn.supplier === supplier.airtable)) {
            merkibjCheckbox.checked = true; // Sett checkbox til checked
        } else {
            merkibjCheckbox.checked = false; // Sett checkbox til unchecked (valgfritt)
        }

        // Sett navn
        const name = supplierElement.querySelector('.suppliername');
        if (name) name.textContent = supplier.name || "Ukjent navn";
        
        // Sett kortinfo
        const shortinfo = supplierElement.querySelector('.shortinfo');
        if (shortinfo) shortinfo.textContent = supplier.kortinfo || "Ingen informasjon tilgjengelig";

        // Sett kategori
        const kategori = supplierElement.querySelector('.kategori');
        if (kategori) kategori.textContent = supplier.category || "-";

        // Sett rabbat merke
        const cuttext = supplierElement.querySelector('.cutttext');
        if(supplier.cuttext){
            if (cuttext) cuttext.textContent = supplier.cuttext || "-";
            cuttext.parentElement.parentElement.style.display = "flex";  
        }else{
            cuttext.parentElement.parentElement.style.display = "none";  
        }

        // Sett logo
        const logo = supplierElement.querySelector('.logoelement');
        if (logo) {
            if (supplier.logo) {
                logo.src = supplier.logo;
            } else {
                logo.src = "path/to/default/logo.png"; // Standardbilde hvis logo mangler
            }
        }


        // Sett ny merke (hvis supplier.created er mindre enn 30 dager siden)
            const newwrapper = supplierElement.querySelector('.newwrapper');

            if (supplier.created) {
                const createdDate = new Date(supplier.created); // Konverter til dato
                const today = new Date();
                const diffTime = today - createdDate; // Tidsdifferanse i millisekunder
                const diffDays = diffTime / (1000 * 60 * 60 * 24); // Konverter til dager

                // Sjekk om differansen er mindre enn 30 dager
                let isNew = diffDays < 30;

                if (isNew) {
                    newwrapper.style.display = "flex";
                } else {
                    newwrapper.style.display = "none";
                }
            } else {
                // Skjul hvis det ikke finnes en opprettelsesdato
                newwrapper.style.display = "none";
            }


        //bakside
        const nameback = supplierElement.querySelector('.suppliernameback');
        if (nameback) nameback.textContent = supplier.name || "Ukjent navn";

        // Sett bilde
        const image = supplierElement.querySelector('.imageback');
        if (image) {
            if (supplier.logo) {
                image.src = supplier.image;
            } else {
                image.style.display = "none";
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
    }else if(id == "responsOnboarded"){
        responsOnboarded(data);
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





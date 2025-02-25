function startEmployerView(data){

    console.log("Dette er ansattsiden og dette er data som kommer",data)
    document.getElementById("employeeviewTagButton").click();

    loadEmployeeView(data);
}

function loadEmployeeView(data){

    const companyLogo = document.getElementById("companyLogoElement");
    companyLogo.src = data.companylogo;

     // Hent inputfeltet
     const companyIdField = document.getElementById("firmaidairtableId");
     companyIdField.value = activeCompany.airtable;

    let textMessage = data.companyname + 
    " er medlem av innkjøpsGRUPPEN AS, og det betyr at du som ansatt kan benytte deg av medlemsfordeler hos et utvalg leverandører.<br>" +
    "For å gjøre bruk av disse fordelene må du trykke på knappen under og opprette en bruker. Dette er helt gratis og uforpliktende.";

    const employerMessage = document.getElementById("employerMessage");
    employerMessage.innerHTML = textMessage;

    // Konverter JSON-strenger til objekter
    const jsonStrings = data.supplierjson;
    let suppliersArray = convertSuppliersJsonStringsToObjects(jsonStrings);

    listSuppliersPublic(suppliersArray);
}


function listSuppliersPublic(data) {
    console.log(data);

    const supplierContainer = document.getElementById("supplierPubliclist");
    if (!supplierContainer) {
        console.error("Ingen container funnet for visning av leverandører.");
        return;
    }
    let filteredData = data;

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

    const nodeElement = elementLibrary.querySelector(".suppliercard.public");
    if (!nodeElement) {
        console.error("Ingen '.suppliercard' funnet i 'elementlibrary'.");
        return;
    }
    
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
        
        // Sett navn
        const name = supplierElement.querySelector('.suppliername');
        if (name) name.textContent = supplier.name || "Ukjent navn";
        
        // Sett kortinfo
        const shortinfo = supplierElement.querySelector('.shortinfo');
        if (shortinfo) shortinfo.textContent = supplier.kortinfo || "Ingen informasjon tilgjengelig";

        // Sett kategori
        const kategori = supplierElement.querySelector('.kategori');
        if (kategori) {
            if (Array.isArray(supplier.category)) {
                // Kombiner alle name-nøkler med "-" som separator
                kategori.textContent = supplier.category.map(cat => cat.name).join(' - ') || "-";
            } else {
                kategori.textContent = "-";
            }
        }


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
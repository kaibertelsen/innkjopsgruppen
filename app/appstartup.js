var companys = [];
var memberId;
var userid;
var companyId;
var userObject;
var suppliers = [];
let currentFlippedElement = null;
var activeCompany = {};
var activeSupplier = {};
var mainlistElementClass = ".suppliercard";
var areas;
var categories;
var Employeemode = false;
var isSharkey = false;
var isLoggedin = false;
var activeSupplierList;


document.getElementById("menybuttonopener").addEventListener("click", function() {
    const menyElement = document.getElementById("menyelementwrapper");
    if (menyElement.style.height === "0px" || menyElement.style.height === "") {
        showMenye();
    } else {
        hideMenye();
    }
});

hideMenye();

function hideMenye(){
    const menyElement = document.getElementById("menyelementwrapper");
    menyElement.style.height = "0px"; // Skjuler igjen
    menyElement.style.maxWidth = "0px"
}

function showMenye(){
    const menyElement = document.getElementById("menyelementwrapper");
    menyElement.style.height = menyElement.scrollHeight + "px";
    menyElement.style.maxWidth = "500px"; // Sett en max-grense for animasjonen
}

document.getElementById("elementlibrary").style.display = "none";

function startUp(userid){
    GETairtable("app1WzN1IxEnVu3m0","tblMhgrvy31ihKYbr",userid,"userResponse");
}

function rootPageControll(page){

    if(!isSharkey){
        if(page == "welcome"){
            document.getElementById("tabwelcome").click();
        }else if(page == "list"){
            document.getElementById("tablist").click();
        }else if(page == "login"){
            document.getElementById("tablogin").click();
        }
    }

}
//skul logo frem til inlasting
document.getElementById("logobutton").style.display = "none";

function userResponse(data) {
  
    if (data.fields?.onboarded && data.fields.onboarded === true) {
        // Brukeren er allerede onboarded
        console.log("Brukeren er allerede onboarded.");
    } else {
        // Brukeren er ikke onboarded, fortsett med onboarding-prosessen
        rootPageControll("welcome");
    }

    userObject = data.fields;

    // Sjekk om data.fields.companyjson eksisterer og er en array
    if (!data || !data.fields || !data.fields.companyjson || !Array.isArray(data.fields.companyjson)) {
        console.error("Brukeren har ikke noe selskap tilknyttet");
        return; // Avbryt hvis data ikke er gyldig
    }

    if (data?.fields?.rolle === "ansatt") {
        // Dette er en ansattbruker
        setEmployerMode();
    }else{
        document.getElementById("companypagebutton").style.display = "block";
    }
    
    // sjekker om det er en superadmin som skal opptre på vegne av et selskap
    //hvis det er lagret en nøkkel i sessionStorage som heter "representing" så er det en superadmin som opptrer på vegne av et selskap
    if (sessionStorage.getItem("representing")) {
        const rawData = sessionStorage.getItem("representing");
        companys = convertCompanyRepresenting(rawData);
      
        //fjerner nøkkelen fra sessionStorage
        sessionStorage.removeItem("representing");
    }else{
        // Konverter JSON-strenger til objekter
        const jsonStrings = data.fields.companyjson;
        companys = convertJsonStringsToObjects(jsonStrings);
    }
   

    //sjekker gjennom companys.connections arrayen og fjerner de koblingene som har true i delete nøkkelen
    companys.forEach(company => {
        if (company.connection) {  
            company.connection = company.connection.filter(conn => !conn.delete);
        }
    });


    // Legg til objektet øverst i arrayen
    //companys.unshift({ Name: "Ansattavtaler", airtable: "ansatt"});
    // Hent selector fra DOM
    const selector = document.getElementById("companySelector");
    if (!selector) {
        console.error("Selector med ID 'companySelector' finnes ikke i DOM.");
        return;
    }

    // Last data inn i selector
    loadSelector(selector, companys);

 
    //om det bare er et selskap så skjul rullegardin
   if(companys.length<2){
    selector.style.display = "none";
   }
    
    // Sjekk om favorittselskap eksisterer og velg det, ellers velg første selskap
    if (data.fields?.companystart) {
        const favoriteCompanyId = data.fields.companystart[0];
        const optionToSelect = [...selector.options].find(
            option => option.value === favoriteCompanyId
        );

        if (optionToSelect) {
            selector.value = favoriteCompanyId; // Velger favorittselskapet
            activeCompany = companys.find(company => company.airtable === favoriteCompanyId);
        } else {
            console.warn(`Favorittselskapet med ID '${favoriteCompanyId}' finnes ikke i listen.`);
        }
    } else {
        // Velg det første selskapet i listen dersom ingen favorittselskap er angitt
        if (companys.length > 0) {
            selector.value = companys[0].airtable; // Sett første element som valgt
            activeCompany = companys[0];
        } else {
            console.warn("Ingen selskaper tilgjengelige i listen.");
        }
    }

    //setter riktig design i layout på bekgrunn av selskapets gruppetilhørighet
    settGroupDesign(activeCompany);

 
    //hvis portallogo
    document.getElementById("logobutton").style.display = "inline-block";

    //hente leverandører
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC","recwnwSGJ0GvRwKFU","supplierResponse");
}


function settGroupDesign(company){

    //sjekk om gruppelogo skal byttes
    const logoImage = document.getElementById("logobutton");
    logoImage.removeAttribute("srcset");

    if(company.grouplogo && company.grouplogo.trim() !== "") {
        logoImage.src = company.grouplogo;
    }else{
        //standard IG logo
        logoImage.src = "https://cdn.prod.website-files.com/6346cf959f8b0bccad5075af/6797524cff44bf02fd8ee5e8_IG-logo-app.png";
    }
     
    
    //sjekk om customer sin logo og selectoer skal vises
    if (company?.groupcustomerlogolayout?.toUpperCase() === "TRUE") {
            console.log("Skal vise customerlogo");
            const customerlayoutConteiner = document.getElementById("customerlayoutConteiner");
            if (customerlayoutConteiner) {
                //last in selector
                const selectorInListPage = document.getElementById("companySelectorinListPage");
                if (selectorInListPage) {
                     // Last data inn i selector
                    loadSelector(selectorInListPage, companys);
                    selectorInListPage.value = company.airtable; // Velg selskapet
                }    
                //vis customerlayout
                customerlayoutConteiner.style.display = "flex";
            }
    }

    //last inn logo
    const customerlogo = document.getElementById("customerlogopages");
    if (customerlogo) {
        customerlogo.src = company.logo;
    }
        
    //hvis det foreligger bakgrunnsfarge så sett denne på headeren
    const headerbackground = document.getElementById("headerbackground");
   
    //bakgrunnsbilde
        if (company.groupheaderimage && company.groupheaderimage.trim() !== "") {
            // Sett nødvendige stiler for å få riktig visning
            headerbackground.style.setProperty("background", `url('${company.groupheaderimage}')`, "important");
            headerbackground.style.setProperty("background-size", "cover", "important");
            headerbackground.style.setProperty("background-position", "center top", "important");
            headerbackground.style.setProperty("background-repeat", "no-repeat", "important");
            // (Fjerner background-attachment fixed hvis du vil at bakgrunn skal scrolle med innholdet)
            headerbackground.style.setProperty("width", "100%", "important");
        }else  if (headerbackground && company.groupcolor !== "") {
            //sett farge på bakgrunn
            headerbackground.style.setProperty("background", company.groupcolor, "important");
        }else{
             //sett standard farge
            headerbackground.style.setProperty("background", "#172d3f", "important");
        }
    //Aktiv farge/ knappefarge
        let activeColor = "#5b9eca"; // Standard farge
        if (company.grouplablecolor && company.grouplablecolor.trim() !== "") {
            activeColor = company.grouplablecolor;
        }

        const lablecolor = document.querySelectorAll(".lablecolor");
        lablecolor.forEach(element => {
            element.style.backgroundColor = activeColor;
        });
 
        // Oppdater globale klasser som .active og input:checked + .slider
        updateGlobalThemeColor(activeColor);

}

function updateGlobalThemeColor(color) {
    let styleTag = document.getElementById("dynamic-active-style");

    if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "dynamic-active-style";
        document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `
        .active {
            background-color: ${color} !important;
        }
        input:checked + .slider {
            background-color: ${color} !important;
        }
    `;
}

function convertCompanyRepresenting(jsonInput) {
    try {
        // Hvis det allerede er et objekt (ikke en streng), returner det direkte
        if (typeof jsonInput === "object") return jsonInput;

        // Hvis det er en streng med gyldig JSON, parse og returner
        return JSON.parse(jsonInput);
    } catch (e) {
        console.error("Feil ved konvertering av companyjson:", e);
        return [];
    }
}

function registrerOnboarded(){
    let body = {onboarded:true};
    patchAirtable("app1WzN1IxEnVu3m0","tblMhgrvy31ihKYbr",userid,JSON.stringify(body),"responsOnboarded")
}

function responsOnboarded(data){
    console.log(data);
}

function loadSelector(selector, data) {
    selector.innerHTML = ''; 
    // Dynamisk lasting av data i select-feltet
    data.forEach(item => {
        const option = document.createElement("option"); // Lager et option-element
        option.value = item.airtable; // Setter verdien til airtable-ID-en
        option.textContent = item.Name; // Setter tekstinnholdet til Name
        selector.appendChild(option); // Legger til option i select-feltet (riktig!)
    });
}

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
        categories = getUniqueCategories(suppliers);
        areas = getUniqueAreas(suppliers);
        loadFilter();
        // Kall funksjonen som gjør klar leverandørene for videre behandling
        suppliersReady();
    
}

function getUniqueCategories(suppliers) {
    // Hent ut unike kategorier basert på nøkkelen "airtable"
    let uniqueCategoriesMap = new Map();

    suppliers.forEach(supplier => {
        if (Array.isArray(supplier.category)) {
            supplier.category.forEach(cat => {
                // Sjekk om kategorien har nøkkelen "airtable" og legg den til i Map hvis ikke allerede finnes
                if (cat.airtable && !uniqueCategoriesMap.has(cat.airtable)) {
                    uniqueCategoriesMap.set(cat.airtable, cat);
                }
            });
        }
    });

    // Konverter Map-verdiene til en array med unike kategorier
    let uniqueCategories = Array.from(uniqueCategoriesMap.values());

    // Legg til kategorien { name: "Alle", airtable: "" } først i arrayen
    uniqueCategories.unshift({ name: "Alle", airtable: "" });

    // Sorter kategoriene alfabetisk etter 'name'
    uniqueCategories.sort((a, b) => a.name.localeCompare(b.name, 'nb'));

    return uniqueCategories;
}

function getUniqueAreas(suppliers) {
    let uniqueAreas = new Set();

    // Hent unike områder fra nøkkelen "omradet"
    suppliers.forEach(supplier => {
        if (supplier.omradet) {
            // Opprett et objekt med `name` og `airtable`
            const area = {
                name: supplier.omradet,
                airtable: supplier.omradet
            };

            // Legg til objektet som en JSON-streng for unike verdier
            uniqueAreas.add(JSON.stringify(area));
        }
    });

    // Konverter Set til array med objekter
    let uniqueAreasArray = Array.from(uniqueAreas).map(area => JSON.parse(area));

    // Sorter områdene alfabetisk på `name`
    uniqueAreasArray.sort((a, b) => a.name.localeCompare(b.name, 'nb'));

    // Legg til området { name: "Alle", airtable: "" } først i arrayen
    uniqueAreasArray.unshift({ name: "Alle", airtable: "" });

    return uniqueAreasArray;
}

function suppliersReady(){
    const selector = document.getElementById("companySelector");
    companyChange(selector.value);
}

function employerModeLayout(status){

    const companypagebutton = document.getElementById("companypagebutton");
    const savingmoneybutton = document.getElementById("savingmoneybutton");
    const dealsIcon = document.getElementById("filtermydealsbutton");
    const typeDealsFilterwrapper = document.getElementById("typeDealsFilterwrapper");
  
    if(status){
        companypagebutton.style.display = "none";
        savingmoneybutton.style.display = "none";
        dealsIcon.style.display = "none";
        typeDealsFilterwrapper.style.display = "none";
    }else{
        companypagebutton.style.display = "block";
       // savingmoneybutton.style.display = "block";
        dealsIcon.style.display = "inline-block";
        typeDealsFilterwrapper.style.display = "block";
    }
   
}

function companyChange(companyId) {
    console.log("List på bakgrunn av dette selskapet: " + companyId);
    let filteredSuppliers = [];
 
    if(isPersonalModeON()){
        filteredSuppliers = suppliers.filter(supplier => {
            return supplier.category.some(category => category.airtable === "recSbtJnNprzB42fd");
        });
       
    }else{
        // Finn selskapet basert på ID
        const selectedCompany = companys.find(company => company.airtable === companyId);
        if (!selectedCompany) {
            console.error("Fant ikke selskap med ID: " + companyId);
            return;
        }

        activeCompany = selectedCompany;

        // Filtrer leverandører basert på gruppetilhørighet
        filteredSuppliers = suppliers.filter(supplier => {
            return supplier.group.some(group => group.airtable === selectedCompany.group);
        });

    }

    settGroupDesign(activeCompany);

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
    //søkefeltet
    let filteredData =  filterSupplierListsearchField(data);
    
    // Sjekk om filteret er aktivt mine avtaler hvis aktiv
    const hasActiveDeals = document.getElementById("filtermydealsbutton").classList.contains("active");
    if (hasActiveDeals) {
        // Hent alle supplier-verdiene fra activeCompany.connection
        const activeSuppliers = activeCompany.connection.map(conn => conn.supplier);

        // Filtrer arrayen basert på matching i "airtable"-nøkkelen
        filteredData = filteredData.filter(item => activeSuppliers.includes(item.airtable));
    }

    //sjekk om listensfilter er slått på kategorier
    filteredData = filterSupplierListCategory(filteredData);

    //sjekk om listensfilter er slått på OMRÅDET
    filteredData = filterSupplierListAreas(filteredData);

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
        if(Employeemode){
            merkibjCheckbox.parentElement.style.display = "none";
        }else{
            // Sjekk om noen av objektene i selectedCompany.connection har en "supplier" som matcher supplier.airtable
            if (activeCompany.connection.some(conn => conn.supplier === supplier.airtable)) {
                merkibjCheckbox.checked = true; // Sett checkbox til checked
            } else {
                merkibjCheckbox.checked = false; // Sett checkbox til unchecked (valgfritt)
            }
            // Legg til eventlistener for å kjøre `supplierConnecting` når checkboxen trykkes
            merkibjCheckbox.addEventListener("click", function() {
                // Send med supplier og checkboxen til funksjonen
                supplierConnecting(supplier, merkibjCheckbox);
            });
        }
        // Sett navn
        const name = supplierElement.querySelector('.suppliername');
        if (name) name.textContent = supplier.name || "Ukjent navn";
        
        // Sett kortinfo
        const shortinfo = supplierElement.querySelector('.shortinfo');
        if (shortinfo) shortinfo.innerHTML = supplier.kortinfo || "Ingen informasjon tilgjengelig";

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

        // Sett knapp til leverandørsiden
        const supplierpagebutton = supplierElement.querySelector('.supplierpagebutton');
        if (supplierpagebutton) {
            // Legg til en click-eventlistener som triggere funksjonen `supplierChosed`
            supplierpagebutton.addEventListener('click', function() {
                supplierChosed(supplier);  // Kall funksjonen med leverandørdataen
            });
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
    }else if(id == "responsEmailsearchServer"){
        responsEmailsearchServer(data);
    }else if(id == "responseInvitationSendt"){
        responseInvitationSendt(data);
    }else if(id == "responPostpublicLink"){
        responPostpublicLink(data);
    }else if(id == "responsShareKeyControll"){
        responsShareKeyControll(data);
    }else if(id == "responseCreatUser"){
        responseCreatUser(data);
    }else if(id == "acceptInvitationCompanyResponse"){
        acceptInvitationCompanyResponse(data);
    }else if(id == "responseUserInvitationAcceptExist"){
        responseUserInvitationAcceptExist(data);
    }else if(id == "responseInvitationAccept"){
        responseInvitationAccept(data);
    }else if(id == "responsGenerateLink"){
        responsGenerateLink(data);
    }else if(id == "responseGenerateEmployerLink"){
        responseGenerateEmployerLink(data);
    }else if(id == "responseEmployerLinkCompany"){
        responseEmployerLinkCompany(data);
    }else if(id == "responsEmailsearchServerEmployer"){
        responsEmailsearchServerEmployer(data);
    }else if(id == "companyControllResponse"){
        companyControllResponse(data);
    }else if(id == "responsSupplierConnection"){
        responsSupplierConnection(data);
    }else if(id == "responsZapierUrl"){
        responsZapierUrl(data);
    }else if(id == "responseDeleteConenction"){
        responseDeleteConenction(data);
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

            let shortinfoValue = '';
            if (jsonString.includes('"kortinfo":')) {
                // Ekstraher `info`-feltet med en regex (forutsatt korrekt JSON-format)
                const shortinfoMatch = jsonString.match(/"kortinfo":\s*"(.*?)"(,|\})/s);
                if (shortinfoMatch) {
                    shortinfoValue = shortinfoMatch[1];  // Ekstraher verdien av `info`
                    jsonString = jsonString.replace(/"kortinfo":\s*".*?"(,|\})/s, '"kortinfo":""$1');  // Fjern HTML-innholdet midlertidig
                }
            }


            // Parse JSON-strengen uten HTML-dataen
            const data = JSON.parse(jsonString);

            // Legg tilbake `info`-feltet
            data.info = infoValue;
            data.kortinfo = shortinfoValue;

            // Sørg for at "group" og "category" alltid er arrays
            if (!data.group) {
                data.group = [];
            }
            if (!data.category) {
                data.category = [];
            }
            if (!data.attachment) {
                data.attachment = [];
            }

            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}

function supplierChosed(supplier) {
    console.log(supplier);
    activeSupplier = supplier;
    const checkbox = document.getElementById("supplierSwitsjIntern");
    if(Employeemode){
        checkbox.parentElement.style.display = "none";
    }else{
        //sjekke om denne leverandøren et tilkoblet
        checkbox.parentElement.style.display = "block";
        if (activeCompany.connection.some(conn => conn.supplier === supplier.airtable)) {
            checkbox.checked = true;
        }else{
            checkbox.checked = false;
        }
    }
    // Simulerer klikk på elementet med id "tabsupplier"
    document.getElementById("tabsupplier").click();

    let supplierconteinerpage = document.getElementById("supplierconteinerpage");

    //logo
      // Sett logo
      const logo = supplierconteinerpage.querySelector('.subpagelogo');
      if (logo) {
          if (supplier.logo) {
              logo.src = supplier.logo;
          } else {
              logo.src = "path/to/default/logo.png"; // Standardbilde hvis logo mangler
          }
      }
    
    // Oppdaterer navnet på leverandørsiden
    let name = document.getElementById("suppierpagename");
    if (name) {
        name.textContent = supplier.name || "Ukjent navn";
    }

    // Oppdaterer innholdet på leverandørsiden
    let contentview = document.getElementById("suppliercontentview");
    if (contentview) {
        // Vurder sikkerhet: Bare bruk `innerHTML` hvis `supplier.info` er klarert HTML
        contentview.innerHTML = supplier.info || "<p>Ingen informasjon tilgjengelig.</p>";
    }

    //list dokumenter
    listDocuments(supplier.attachment);

    //sett bilde om det eksisterer
    let image = document.getElementById("imageholdersupplier");
    if(supplier.image){
        image.src = supplier.image;
        image.style.display = "block";

    }else{
        image.style.display = "none";
    }
}

function listDocuments(attachments) {
    const documentList = document.getElementById("documentlist");
    if (!documentList) {
        console.error("Ingen container funnet for visning av dokumenter.");
        return;
    }
    // Tøm container
    documentList.innerHTML = '';

    const libraryElement = document.getElementById("documentlibrary");
    if (!libraryElement) {
        console.error("Ingen 'documentlibrary' funnet.");
        return;
    }

    const nodeElement = libraryElement.querySelector(".linkbuttondocument");
    if (!nodeElement) {
        console.error("Ingen '.documentholder' funnet i 'documentlibrary'.");
        return;
    }

    attachments.forEach(attachment => {
        const buttonElement = nodeElement.cloneNode(true);
    
        buttonElement.href = attachment.url || "#";
        buttonElement.target = "_blank";
        buttonElement.textContent = attachment.name || "Ukjent navn";
    
        // Legg til i listen
        documentList.appendChild(buttonElement);
    });
}

function savingMoney(){
      // Simulerer klikk på elementet
      document.getElementById("savingmoneytabbutton").click();
}

document.getElementById("supplierSwitsjIntern").addEventListener("change", function() {
    supplierConnecting(activeSupplier, this);
    //last suppiers in i listen på nytt
    listSuppliers(activeSupplierList);
});

function supplierConnecting(supplier, checkbox) {
    console.log(supplier);

    // Sjekk om checkboxen er checked
    if (checkbox.checked) {
        // Bekreft tilknytning
        const confirmMessage = `Ønsker du å tilknyttes leverandøren ${supplier.name}?\nDet vil da gå informasjon til leverandøren slik at du blir lagt til denne avtalen.`;

        if (confirm(confirmMessage)) {
            checkbox.checked = true; // Behold checked

            // Oppdaterer lokal kobling
            activeCompany.connection.push({
                "company": activeCompany.airtable,
                "supplier": supplier.airtable,
                "airtable": "" // Ny tilkobling vil få en ID etter synk med Airtable
            });

            connectToSupplier(supplier);
        } else {
            checkbox.checked = false; // Hvis ikke bekreftet, sett unchecked
        }
    } else {
        // Bekreft fjerning av tilknytning
        const confirmMessage = `Ønsker du å fjerne tilknytningen?`;

        if (confirm(confirmMessage)) {
            checkbox.checked = false; // Behold unchecked

            // Finn tilkoblingen som skal slettes basert på supplier.airtable
            let thisConnectionIndex = activeCompany.connection.findIndex(conn => conn.supplier === supplier.airtable);

            if (thisConnectionIndex !== -1) {
                let thisConnection = activeCompany.connection[thisConnectionIndex];

                // Slett fra Airtable hvis ID eksisterer
                if (thisConnection.airtable) {
                    let body = JSON.stringify({ delete: true });
                    patchAirtable("app1WzN1IxEnVu3m0", "tblLjCOdb9elLmKOb", thisConnection.airtable, body, "responseDeleteConnection");
                }

                // Fjern tilkoblingen fra `activeCompany.connection`
                activeCompany.connection.splice(thisConnectionIndex, 1);
                console.log(`Tilknytning til ${supplier.name} fjernet.`);
            } else {
                console.warn(`Ingen tilkobling funnet for leverandør: ${supplier.name}`);
            }

        } else {
            checkbox.checked = true; // Hvis ikke bekreftet, sett checked igjen
        }
    }
}

function responseDeleteConenction(data){
    console.log(data);
}

function connectToSupplier(supplier){
    // send kobling til airtable


    //om dette er en superadmin som utfører tilkoblinger på vegne av kunden så sjekk først om det er en admin i selskapet om ikke så sjekk om det er en invitasjon
    //og med adminrolle, om ikke det så skal ikke kontaktperson komme med

    // Avklar om kontaktperson (bruker) skal legges ved
    let inkluderBruker = true;

    // Hvis superadmin kobler på vegne av kunden
    if (userObject?.superadmin?.includes(supplier?.klient)) {
        
        console.log("Superadmin kobler på vegne av kunden");
    }



    let body = JSON.stringify(
        {company:[activeCompany.airtable],
            supplier:[supplier.airtable],
            bruker:[userid],
            contactinfotosupplier: "test",
        });






    POSTNewRowairtable("app1WzN1IxEnVu3m0","tblLjCOdb9elLmKOb",body,"responsSupplierConnection")

}

function responsSupplierConnection(rawdata) {
    let data = rawdata.fields;

    if (data?.outputnr) {
        let outputnr = data.outputnr[0];
        let Url = "https://hooks.zapier.com/hooks/catch/10455257/2gk1hb3/";
        let body = { mailto: "", name: "", subject: "", content: "", attachment: "", type: "", data: "" };

        let orgnr = data.companyorgnr[0] || "";
        let adress = data.companyadress[0] || "";
        let postnr = data.companypostnr[0] || "";
        let city = data.companycity[0] || "";

        // Formatering av kundedata i HTML
        function formatCustomerData() {
            return `
                <p><strong>${data.companyname[0]} (${orgnr})</strong></p>
                <p>Adresse: ${adress}, ${postnr} ${city}</p>
                <p><strong>Kontaktperson:</strong><br>
                ${data.brukernavn[0]}<br>
                Telefon: ${data.brukertelefon ? data.brukertelefon[0] : "Ikke oppgitt"}<br>
                E-post: ${data.useremail[0]}</p>
            `;
        }

        switch (outputnr) {
            case 1:
                // Kunden får en guide på mail
                body = {
                    mailto: data.useremail[0],
                    name: data.brukernavn[0],
                    subject: data.subjectcompany[0],
                    content: data.mailcontentcompany[0],
                    attachment: data.guidfil || "",
                    type: "customer",
                    groupemail: data.groupemail[0] || ""
                };
                break;
            case 2:
            case 4:
            case 5:
                // Leverandør får kundeleads / direkte mail med kundeinfo
                body = {
                    mailto: data.mailtosupplier[0],
                    name: "",
                    subject: data.subjectsupplier[0],
                    content: data.mailcontentsupplier[0],
                    attachment: "",
                    type: "supplier",
                    data: formatCustomerData()
                };
                break;
            case 3:
                // Mail til kundeservice hos Innkjøpsgruppen
                body = {
                    mailto: "post@innkjops-gruppen.no",
                    name: "",
                    subject: `Kunde ${data.companyname[0]} ble tilkoblet leverandøren ${data.suppliername[0]}`,
                    content: data.mailcontentsupplier[0],
                    attachment: "",
                    type: "IG",
                    data: formatCustomerData()
                };
                break;
            default:
                console.warn("Ugyldig outputnr: ", outputnr);
                return;
        }

        sendDataToZapierWebhook(body, Url, "responsZapierUrl");
    }
}

function responsZapierUrl(data){
    console.log(data);
}

function loadmemberCard() {
    const cardWrapper = document.getElementById("cardwrapper");

    if (!cardWrapper) {
        console.error("Elementet med id 'cardwrapper' ble ikke funnet.");
        return;
    }

    const memberCard = cardWrapper.querySelector(".membercard");
    if (!memberCard) {
        console.error("Elementet med klassen 'membercard' ble ikke funnet.");
        return;
    }

    // Konfigurer 3D-effektene og overgangene
    memberCard.style.transformStyle = "preserve-3d";
    memberCard.style.perspective = "1000px";
    memberCard.style.transition = "transform 0.5s ease-in-out, opacity 0.5s ease-in-out";

    // Sjekk om elementet er synlig
    const isVisible = cardWrapper.style.display === "flex";

    if (isVisible) {
        // Start animasjon for skjuling (rotasjon og fade)
        memberCard.style.transform = "rotateY(180deg)";
        memberCard.style.opacity = "0";

        // Etter 0.5 sekunder, skjul elementet
        setTimeout(() => {
            cardWrapper.style.display = "none";
            memberCard.style.transform = "rotateY(0deg)";  // Tilbakestill for neste visning
        }, 500);
    } else {
        // Forbered for visning
        memberCard.style.opacity = "0";
        memberCard.style.transform = "rotateY(180deg)";
        cardWrapper.style.display = "flex";

        // Start visningsanimasjon etter kort forsinkelse
        setTimeout(() => {
            memberCard.style.transform = "rotateY(0deg)";
            memberCard.style.opacity = "1";
        }, 100);

        // Last inn data til kortet
        loadCardData(cardWrapper);
    }
}

function loadCardData(cardWrapper) {
    // Formater nåværende dato til "dd.mmm yyyy"
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);

    // Oppdater dato på kortet
    const cardtime = cardWrapper.querySelector('.cardtime');
    if (cardtime) {
        cardtime.textContent = formattedDate;
    }

    // Oppdater rolle på kortet
    const roll = cardWrapper.querySelector('.roll');
    if (roll) {
        roll.textContent = userObject.rolle || "Ukjent rolle";
    }

    // Oppdater navn på kortet
    const name = cardWrapper.querySelector('.cardname');
    if (name) {
        name.textContent = userObject.navn || "Ukjent navn";
    }

    // Oppdater selskap på kortet
    const company = cardWrapper.querySelector('.cardcompany');
    if (company) {
        company.textContent = activeCompany.Name + " (" + (activeCompany.orgnr || "Ukjent orgnr") + ")";
    }

    // Oppdater kortnummer på kortet
    const cardnumber = cardWrapper.querySelector('.cardnumber');
    if (cardnumber) {
        cardnumber.textContent = userObject.airtable || "Ukjent kortnummer";
    }
}

function formatDate(date) {
    const day = date.getDate();
    const monthNames = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day}. ${month} ${year}`;
}

function ruteContorll(){
    let shareId = getTokenFromURL("shareId");
    let shareKey = getTokenFromURL("shareKey");
    let actCode = getTokenFromURL("actCode");

    if (shareId && shareKey){
        isSharkey = true;
        document.getElementById("tabloadingsite").click();
        getRecordWithShareKeyButton(shareId,shareKey,"responsShareKeyControll");
    }else if(actCode){
        //aktiveringskode
        runActivation(actCode);
    }else{
        isSharkey = false;
    }
}

function getTokenFromURL(key){
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get(key); // Henter verdien av 'id'-parameteren
    return id;
}

function responsShareKeyControll(data) {
    // Sjekk om tabellen er en invitasjonsforespørsel
    if (data._table.name === "tblc1AGhwc6MMu4Aw") {
        console.log("Dette er en invitasjonsforespørsel.");
        startUserInvitationView(data.fields);
    } else if(data._table.name === "tblfDzgRjRKBiIxM3"){
        //dette er en ansattdelingslink
        startEmployerView(data.fields);

    } else {
        console.log("Dette er ikke en invitasjonsforespørsel.");
    }
    // Logg hele dataobjektet for debugging
    console.log(data);
    isSharkey = false;
}


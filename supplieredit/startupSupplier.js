var gsuppliers = [];
var activeSupplier = {};
var malonetext;
var maltotext;
var orginaltext = "";
var gGroups = [];
var gCategorys = [];
var gOutputs = [];
let uploadedDocURL = ""; // Variabel for å lagre URL-en til PDF-en
var GlobalConnections = [];

function getSuppier(){     
//hente leverandører
GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC","recwnwSGJ0GvRwKFU","supplierResponse","skipCache");
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
    startupSupplierList(suppliers);

    const groups = data.fields.groupjson;
    gGroups = convertGroupJsonStringsToObjects(groups);
    loadeGroupSelector(gGroups);

    
    const categorys = data.fields.categoryjson;
    gCategorys = convertGroupJsonStringsToObjects(categorys);

    const outputs = data.fields.outputjson;
    gOutputs = convertOutputJsonStringsToObjects(outputs);

}

function loadeGroupSelector(groups){
    //last inn kategorier i select supplierFilterGroup
    const supplierFilterGroup = document.getElementById("supplierFilterGroup");
    supplierFilterGroup.innerHTML = "";

    //sortere gruppene alfabetisk
    groups.sort((a, b) => a.Name.localeCompare(b.Name, 'no', { sensitivity: 'base' }));

    supplierFilterGroup.options.add(new Option("Alle grupper", ""));
    groups.forEach(group => {
        supplierFilterGroup.options.add(new Option(group.Name, group.airtable));
    });
}

document.getElementById("searchinput").addEventListener("input", function () {

    // Kjør startupSupplierList med de filtrerte leverandørene
    startupSupplierList(gsuppliers);
});

document.getElementById("openNewsupplierwrapper").addEventListener("click", function () {
    const wrapper = document.getElementById("Newsupplierwrapper");

    if (wrapper.style.display === "none" || wrapper.style.display === "") {
        wrapper.style.display = "block";
    } else {
        wrapper.style.display = "none";
    }
});

document.getElementById("makeNewSupplier").addEventListener("click", function (event) {
    event.preventDefault(); // Forhindrer standard lenkehandling

    const supplierName = document.getElementById("newSuppierName").value.trim();

    if (supplierName === "") {
        alert("Vennligst fyll inn leverandørnavn.");
        return;
    }

    
    //finne høyeste sortering i gsuppliers
    let highestSortering = 0;
    gsuppliers.forEach(supplier => {
        if (supplier.sortering > highestSortering) {
            highestSortering = supplier.sortering;
        }
    });

    highestSortering++;
    // Opprett et nytt leverandør-objekt
    const newSupplier = {
        name: supplierName,
        skjult: true,
        sortering: highestSortering,
        klient: ["recwnwSGJ0GvRwKFU"]
    }
    
    //sende til airtable
    POSTNewRowairtable("app1WzN1IxEnVu3m0","tblrHVyx6SDNljNvQ",JSON.stringify(newSupplier),"responsNewSupplier");

    // Tøm inputfeltet
    document.getElementById("newSuppierName").value = "";
    document.getElementById("Newsupplierwrapper").style.display = "none";

});

function responsNewSupplier(data){

    if(data.fields){
        //oppdaterer lokalt
        let newSupplier = convertSuppliersJsonStringsToObjects([data.fields.json]);
        gsuppliers.push(newSupplier[0]);
        startupSupplierList(gsuppliers);
    }

}

function startupSupplierList(suppliers){
   // Filtrer leverandørene
   suppliers = filterSuppliers(suppliers);

   // Sorter leverandørene alfabetisk
   suppliers = sortSuppliers(suppliers);

   // List leverandørene i listen
   listSuppliersinList(suppliers)

}

function filterSuppliers(suppliers) {
    // Hent input-feltet og filterelementene
    const searchInput = document.getElementById("searchinput");
    const supplierFilterSelector = document.getElementById("supplierFilterSelector");
    const supplierFilterGroup = document.getElementById("supplierFilterGroup");

    if (!searchInput) {
        console.error("Fant ikke input-feltet med id 'searchinput'");
        return suppliers;
    }

    if (!supplierFilterSelector) {
        console.error("Fant ikke select-feltet med id 'supplierFilterSelector'");
        return suppliers;
    }

    if (!supplierFilterGroup) {
        console.error("Fant ikke select-feltet med id 'supplierFilterGroup'");
        return suppliers;
    }

    // Hent søketeksten og trim mellomrom
    const searchText = searchInput.value.trim().toLowerCase();
    // Hent valgt filterkategori
    const selectedFilter = supplierFilterSelector.value;
    // Hent valgt gruppefilter
    const selectedGroup = supplierFilterGroup.value;

    return suppliers.filter(supplier => {
        const matchesSearch = supplier.name.toLowerCase().includes(searchText);
        
        const matchesFilter =
            selectedFilter === "" || // Hvis "Alle" er valgt, vis alt
            (selectedFilter === "visible" && !supplier.hidden) || // Synlig leverandør
            (selectedFilter === "hidden" && supplier.hidden); // Skjult leverandør

        // Sjekk om selectedGroup finnes i supplier.group (som er en array av objekter)
        const matchesGroup = 
            selectedGroup === "" || // Hvis ingen gruppe er valgt, vis alle
            (Array.isArray(supplier.group) && 
             supplier.group.some(groupObj => groupObj.airtable === selectedGroup));

        return matchesSearch && matchesFilter && matchesGroup; // Må matche alle tre kriteriene
    });
}

document.getElementById("supplierFilterGroup").addEventListener("change", function() {

    // Kjør startupSupplierList med de filtrerte leverandørene
    startupSupplierList(gsuppliers);
});

document.getElementById("supplierFilterSelector").addEventListener("change", function() {

    // Kjør startupSupplierList med de filtrerte leverandørene
    startupSupplierList(gsuppliers);
});

function sortSuppliers(suppliers) {
    // Filtrer ut ugyldige eller tomme verdier (valgfritt)
    let filteredSuppliers = suppliers.filter(supplier => supplier.name && supplier.name.trim() !== "");

    filteredSuppliers.sort((a, b) => {
        // Konverter 'sortering' til tall, eller sett en lav verdi for manglende verdier
        const sortA = parseInt(a.sortering) || 0;
        const sortB = parseInt(b.sortering) || 0;

        // Først sorter i synkende rekkefølge etter 'sortering' (høyeste først)
        if (sortA !== sortB) {
            return sortB - sortA;
        }

        // Hvis sortering er lik, sorter alfabetisk etter navn
        return a.name.localeCompare(b.name, 'no', { sensitivity: 'base' });
    });

    return filteredSuppliers;
}

function listSuppliersinList(suppliers) {
    // Hent containeren for leverandører
    const supplierContainer = document.getElementById("supplierlistconteiner");
    if (!supplierContainer) {
        console.error("Ingen container funnet for visning av leverandører.");
        return;
    }

    // Tøm container
    supplierContainer.innerHTML = '';

    const elementLibrary = document.getElementById("elementlibrary");
    if (!elementLibrary) {
        console.error("Ingen 'elementlibrary' funnet.");
        return;
    }

    const nodeElement = elementLibrary.querySelector(".supplier");
    if (!nodeElement) {
        console.error("Ingen '.supplier' funnet i 'elementlibrary'.");
        return;
    }

    // Sett counter
    const counter = document.getElementById("counterlist");
    counter.textContent = suppliers.length + " stk.";
    counter.style.display = "block";

    suppliers.forEach((supplier, index) => {
        const supplierElement = nodeElement.cloneNode(true);
        supplierElement.setAttribute("draggable", "true"); // Gjør elementet dra-bart
        supplierElement.dataset.index = index; // Lagre original indeks
        supplierElement.dataset.sortering = supplier.sortering || 0; // Lagre sorteringsverdi
        supplierElement.dataset.airtable = supplier.airtable; // Lagre Airtable-ID

        // Sett navn
        const name = supplierElement.querySelector('.suppliername');
        if (name) name.textContent = supplier.name || "Ukjent navn";

        // Sett sorteringsnummer
        const sortnr = supplierElement.querySelector('.sortnr');
        if (sortnr) sortnr.textContent = index + 1; // Viser original indeks
        

        // Legg til klikk-event for åpning
        const button = supplierElement.querySelector('.openingbutton');
        if (button) {
            button.addEventListener("click", function () {
                openSupplier(supplier);
            });
        }

        // 🎯 Dra-og-slipp event listeners
        supplierElement.addEventListener("dragstart", handleDragStart);
        supplierElement.addEventListener("dragover", handleDragOver);
        supplierElement.addEventListener("drop", handleDrop);
        supplierElement.addEventListener("dragend", handleDragEnd);

        // Legg til leverandøren i containeren
        supplierContainer.appendChild(supplierElement);
    });
}

function reCalcIndexSupplierlist(){
    const supplierContainer = document.getElementById("supplierlistconteiner");
    const suppliersList = [...supplierContainer.children];
    //sette nytt nummer på sortering
    suppliersList.forEach((supplier, index) => {
        supplier.dataset.index = index;
        supplier.querySelector('.sortnr').textContent = index + 1; // Viser original indeks
    }
    );  
}

// 🔹 Funksjon for når et element starter å dras
function handleDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.dataset.index);
    event.target.classList.add("dragging");
}

// 🔹 Funksjon for når et element dras over et annet element
function handleDragOver(event) {
    event.preventDefault(); // Hindrer standard oppførsel
    const draggingElement = document.querySelector(".dragging");
    const dropTarget = event.target.closest(".supplier");
    
    if (dropTarget && draggingElement !== dropTarget) {
        const supplierContainer = document.getElementById("supplierlistconteiner");
        const children = [...supplierContainer.children];
        const draggingIndex = children.indexOf(draggingElement);
        const targetIndex = children.indexOf(dropTarget);
        
        if (draggingIndex > targetIndex) {
            supplierContainer.insertBefore(draggingElement, dropTarget);
        } else {
            supplierContainer.insertBefore(draggingElement, dropTarget.nextSibling);
        }
    }
}

// Funksjon som håndterer når et element slippes
function handleDrop(event) {
    event.preventDefault();
    
    const draggingElement = document.querySelector(".dragging");
    if (!draggingElement) return;
    
    draggingElement.classList.remove("dragging");

    const supplierContainer = document.getElementById("supplierlistconteiner");
    const suppliersList = [...supplierContainer.children];

    // Hent elementet over og under
    const previousElement = draggingElement.previousElementSibling;
    const nextElement = draggingElement.nextElementSibling;

    let newSortering;

    // Hent sorteringsverdier fra over og under
    const previousSortering = previousElement ? parseFloat(previousElement.dataset.sortering) : null;
    const nextSortering = nextElement ? parseFloat(nextElement.dataset.sortering) : null;

    // Beregn ny sorteringsverdi
    if (previousSortering !== null && nextSortering !== null) {
        newSortering = (previousSortering + nextSortering) / 2;
    } else if (previousSortering !== null) {
        newSortering = previousSortering + 1; // Hvis det er første element, legg til 1
    } else if (nextSortering !== null && nextElement == null) {
        newSortering = nextSortering - 1; // Hvis det er siste element, trekk fra 1
    } else if (previousSortering == null) {
        newSortering = nextSortering + 1; // Hvis det er det første elementet i listen
    } else {
        newSortering = 1000; // Standardverdi hvis ingen andre verdier finnes
    }

    // Oppdater dataset og synlig sorteringsnummer
    draggingElement.dataset.sortering = newSortering;
    const sortnr = draggingElement.querySelector('.sortnr');
    if (sortnr) sortnr.textContent = newSortering.toFixed(1); // Viser ny sortering

    console.log(`Ny sortering: ${newSortering}`);

    //oppdatere lokalt o gsuppliers array finne den på bakgrun av dataset.airtable
    gsuppliers.find(supplier => supplier.airtable === draggingElement.dataset.airtable).sortering = newSortering;

    // Lager på serveren
    saveSupplierInfo(draggingElement.dataset.airtable, {sortering: newSortering});

    // Rekalkuler indeksene
    reCalcIndexSupplierlist();

}

// 🔹 Funksjon for når dra-operasjonen er ferdig
function handleDragEnd(event) {
    event.target.classList.remove("dragging");
}
////open leverandøren

function openSupplier(supplier){

    activeSupplier = supplier;

    //Tømme connectionList
    resetConnectionList();

    //hente mer info om denne leverandøren
    GETairtable("app1WzN1IxEnVu3m0","tblrHVyx6SDNljNvQ",supplier.airtable,"moreInfoSupplierResponse");

   
    console.log(supplier);
    //åpne leverandørsiden
    document.getElementById("supplierTagbutton").click();

    const supplierPageConteiner = document.getElementById("supplierPageConteiner");

    const publicSwitsh = document.getElementById("publicSwitsh");
    publicSwitsh.checked = supplier.hidden ? false : true;

    const publicSwitshtext = document.getElementById("publicSwitshtext");
    publicSwitshtext.textContent = supplier.hidden ? "Ikke publisert" : "Publisert";
    
    const suppliernamepage = document.getElementById("supplierNameInput");
    suppliernamepage.value = supplier.name;

    const supplierNameOrgnr = document.getElementById("supplierNameOrgnr");
    supplierNameOrgnr.value = supplier.orgnr || "";

    const supplierlogo = supplierPageConteiner.querySelector(".supplierlogo");
    supplierlogo.src = supplier.logo || "";

    const offerlable = document.getElementById("offerlable");
    offerlable.value = supplier.cuttext

    var shorttextArea = tinymce.get("shorttextArea");
    loadContentIntoEditor(shorttextArea,supplier.kortinfo);


    const contentInfoelement = tinymce.get("contentInfoelement");
    loadContentIntoEditor(contentInfoelement,supplier.info);
    orginaltext = supplier.info;


    listGroups(supplier.group);

    listCategorys(supplier.category);

    const urltosupplierweb = document.getElementById("urltosupplierweb");
    urltosupplierweb.value = supplier.landingsside;

    const presentationImageSupplier = document.getElementById("presentationImageSupplier");
    presentationImageSupplier.src = supplier.image || "";
    
    //last inn outputs i select
    const deliveryMethodSelector = document.getElementById("deliveryMethodSelector");
    deliveryMethodSelector.innerHTML = "";
    deliveryMethodSelector.options.add(new Option("Velg leveringsmetode", ""));
    gOutputs.forEach(output => {
        deliveryMethodSelector.options.add(new Option(output.Name, output.airtable));
    });
  
}

function moreInfoSupplierResponse(data){

    if(!data || !data.fields){
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields'");
        return;
    }

   //legge til mer info om leverandøren
   if(data.fields.output){
    activeSupplier.output = data.fields.output;
   }
   //til leverandøren
    if(data.fields.emneleverandor){
        activeSupplier.suppliersubjectmail = data.fields.emneleverandor;
    }

   if(data.fields.tilleverandor){   
    activeSupplier.suppliermailbody = data.fields.tilleverandor;
   }
   //til kunden
    if(data.fields.emneselskap){
        activeSupplier.customersubjectmail = data.fields.emneselskap;
    }

    if(data.fields.tilselskap){
        activeSupplier.customermailbody = data.fields.tilselskap;
    }

    if(data.fields.guidfil){
        activeSupplier.guidfil = data.fields.guidfil;
    }

    if(data.fields.outputmail){
        activeSupplier.outputmail = data.fields.outputmail;
    }

   //opdater leverandøren
   updateSupplierPage(activeSupplier);
}

function updateSupplierPage(supplier){
    //tillegsinformasjon leverandør

    // FINN RIKTIG Option-element basert på supplier.output og sett den som valgt
    const deliveryMethodSelector = document.getElementById("deliveryMethodSelector");
    deliveryMethodSelector.value = supplier.output || "";

    // Sjekk om supplier.output eksisterer og har minst ett element før du prøver å hente [0]
    const supplierOutput = gOutputs.find(output => output.airtable === (supplier.output?.[0] || ""));

    // Hvis supplierOutput er funnet, bruk description, ellers sett en tom streng
    let description = supplierOutput?.description || "";


    // Sett beskrivelsen i HTML-elementet
    const descriptionMailOutput = document.getElementById("desctiptionMailOutput");  
    descriptionMailOutput.innerHTML = description || "Ingen beskrivelse tilgjengelig";

    //tilknyttningsmailen
    const connectinMailAdress = document.getElementById("connectinMailAdress");
    connectinMailAdress.value = supplier.outputmail || "";

    //hente elementer
    const mailSubjectfield = document.getElementById("mailSubjectfieldinput");
    const contentInfoelement = tinymce.get("mailbodyelement");
    const mailSubjectfieldLabel = document.getElementById("mailSubjectfieldLabel");
    const mailbodyelementLabel = document.getElementById("mailbodyelementLabel");

    //hvis supplier.output er denne verdien"recJV491g6P1iUl8u"
    if(supplier.output?.[0] === "recJV491g6P1iUl8u"){

        mailSubjectfieldLabel.textContent = "Emnet i mail til kunde";
        mailbodyelementLabel.textContent = "Innhold i mail til kunde";

        //laster inn i mailSubjectfield
        mailSubjectfield.value = supplier.customersubjectmail || supplierOutput.customersubjectmail;

        //synligjøre wrapper guideDocWrapper
        document.getElementById("guideDocWrapper").style.display = "block";

        //laster inn i mailbodyelement
        loadContentIntoEditor(contentInfoelement,supplier.customermailbody || supplierOutput.customermailbody);

    }else{
        mailSubjectfieldLabel.textContent = "Emnet i mail til leverandør";
        mailbodyelementLabel.textContent = "Innhold i mail til leverandør";

        //laster inn i mailSubjectfield
        mailSubjectfield.value = supplier?.suppliersubjectmail || supplierOutput?.suppliersubject || "";

    
        //synligjøre wrapper guideDocWrapper
        document.getElementById("guideDocWrapper").style.display = "none";

        //laster inn i mailbodyelement
        loadContentIntoEditor(contentInfoelement,supplier?.suppliermailbody|| supplierOutput?.suppliermailbody || "");
    }

    //hente guideDocURL
    uploadedDocURL = supplier?.guidfil ?? "";

    
   
}

function listGroups(activeGroups){
        let activeGroupsid = [];

        activeGroups.forEach(group => {
            activeGroupsid.push(group.airtable);
        });

    
    // Hent containeren for leverandører
    const groupContainer = document.getElementById("grouplist");
    if (!groupContainer) {
        console.error("Ingen container funnet for visning av leverandører.");
        return;
    }
  
    // Tøm container
    groupContainer.innerHTML = '';

    const elementLibrary = document.getElementById("elementlibrarywrapper");
    if (!elementLibrary) {
        console.error("Ingen 'elementlibrary' funnet.");
        return;
    }

    const nodeElement = elementLibrary.querySelector(".groupbuttom");
    if (!nodeElement) {
        console.error("Ingen '.suppliercard' funnet i 'elementlibrary'.");
        return;
    }


    gGroups.forEach(group => {
        const groupElement = nodeElement.cloneNode(true);
        groupElement.textContent = group.Name;
        groupElement.dataset.groupid = group.airtable;

        //hvis denne gruppen er i listen
        if(activeGroupsid.includes(group.airtable)){
            groupElement.classList.add("active");
        }

        groupElement.addEventListener("click", function() {
            // Kjør funksjonen med den aktive leverandørlisten
            groupFilterTriggered(groupElement); 
        }); 
        groupContainer.appendChild(groupElement);

    });


}

function listCategorys(activeCategorys){
    let activeCategorysid = [];
    activeCategorys.forEach(category => {
        activeCategorysid.push(category.airtable);
    });
    // Hent containeren for leverandører
    const categoryContainer = document.getElementById("categorylist");
    if (!categoryContainer) {
        console.error("Ingen container funnet for visning av leverandører.");
        return;
    }
  
    // Tøm container
    categoryContainer.innerHTML = '';

    const elementLibrary = document.getElementById("elementlibrarywrapper");
    if (!elementLibrary) {
        console.error("Ingen 'elementlibrary' funnet.");
        return;
    }

    const nodeElement = elementLibrary.querySelector(".categorybuttom");
    if (!nodeElement) {
        console.error("Ingen '.groupbuttom' funnet i 'elementlibrary'.");
        return;
    }

    gCategorys.forEach(category => {
        const categoryElement = nodeElement.cloneNode(true);
        categoryElement.textContent = category.name;
        categoryElement.dataset.categoryid = category.airtable;

        //hvis denne gruppen er i listen
        if(activeCategorysid.includes(category.airtable)){
            categoryElement.classList.add("active");
        }

        categoryElement.addEventListener("click", function() {
            // Kjør funksjonen med den aktive leverandørlisten
            categoryFilterTriggered(categoryElement);
        });
        categoryContainer.appendChild(categoryElement);
    });

}

function categoryFilterTriggered(button) {
    const allButtons = button.parentElement.querySelectorAll(".categorybuttom");

    // Toggle "active"-klassen på den klikkede knappen
    button.classList.toggle("active");

    // Hent alle aktive kategorier
    const activeCategorys = Array.from(allButtons).filter(btn => btn.classList.contains("active"));
    const activeCategorysid = activeCategorys.map(category => category.dataset.categoryid);

    // Lagre til databasen
    saveSupplierInfo(activeSupplier.airtable, { kategoriers: activeCategorysid });

    // Oppdater lokalt
    if (typeof gCategorys !== "undefined" && Array.isArray(gCategorys)) {
        // Finn alle objektene i `gCategorys` som matcher `activeCategorysid`
        activeSupplier.category = gCategorys.filter(category => activeCategorysid.includes(category.airtable));
    } else {
        console.warn("gCategorys er ikke definert eller ikke en array");
        activeSupplier.category = [];
    }
}


function groupFilterTriggered(button) {
    const allButtons = button.parentElement.querySelectorAll(".groupbuttom");   

        // Toggling av "active"-klassen på den klikkede knappen
        if (button.classList.contains("active")) {
            button.classList.remove("active"); // Fjern klassen hvis den allerede er satt
        } else {
            button.classList.add("active"); // Legg til klassen hvis den ikke er satt
        }

        // Hent alle aktive grupper
        const activeGroups = Array.from(allButtons).filter(button => button.classList.contains("active"));  
        const activeGroupsid = activeGroups.map(group => group.dataset.groupid);
        saveSupplierInfo(activeSupplier.airtable, {gruppe: activeGroupsid});
    
        // Oppdater lokalt
        if (typeof gGroups !== "undefined" && Array.isArray(gGroups)) {
            // Finn alle objektene i `gGroups` som matcher `activeGroupsid`
            activeSupplier.group = gGroups.filter(group => activeGroupsid.includes(group.airtable));
        }
        else {
            console.warn("gGroups er ikke definert eller ikke en array");
            activeSupplier.group = [];
        }
 
};

document.getElementById("backtolistbutton").addEventListener("click", function () {
    document.getElementById("supplierListTagbutton").click();
});

document.getElementById("publicSwitsh").addEventListener("click", function () {
    const publicSwitshtext = document.getElementById("publicSwitshtext");
    // sjekke om den er checked
    if(this.checked){
        publicSwitshtext.textContent = "Publisert";
        saveSupplierInfo(activeSupplier.airtable, {skjult: false});
        //save lokalt
        activeSupplier.hidden = false;
    }else{
        publicSwitshtext.textContent = "Ikke publisert";
        saveSupplierInfo(activeSupplier.airtable, {skjult: true});
        //save lokalt
        activeSupplier.hidden = true;
    }
});

document.getElementById("deleteSupplierButton").addEventListener("click", function () {

    if (confirm("Er du sikker på at du vil slette denne leverandøren?")) {
        // Slett leverandøren fra databasen
        DELETEairtable("app1WzN1IxEnVu3m0","tblrHVyx6SDNljNvQ",activeSupplier.airtable,"responseDeleteSupplier")
        // Slett leverandøren fra den lokale listen
        gsuppliers = gsuppliers.filter(supplier => supplier.airtable !== activeSupplier.airtable);

        //list leverandørene på nytt
        startupSupplierList(gsuppliers);
        // Gå tilbake til leverandørlisten
        document.getElementById("supplierListTagbutton").click();


    }
});

function responseDeleteSupplier(data){
    console.log(data);
}

document.getElementById("uploadLogoButton").addEventListener("click", function(event) {
    event.preventDefault(); 

    const widget = uploadcare.Widget("#logoUploadcareWidget");
    widget.openDialog().done(function(file) {
        file.done(function(info) {
            const optimizedImageURL = info.cdnUrl + "-/format/auto/-/quality/smart/";
            console.log("Optimalisert bilde URL:", optimizedImageURL);
            document.getElementById("logoImageSupplier").src = optimizedImageURL;
            document.getElementById("saveLogoButton").classList.add("active");
        });
    });
});

document.getElementById("supplierNameInput").addEventListener("blur", function() {
    // Lagre innholdet i databasen
    saveSupplierInfo(activeSupplier.airtable, {name: this.value});

    // Lagre innholdet lokalt
    activeSupplier.name = this.value;

    startupSupplierList(gsuppliers);

});

document.getElementById("supplierNameOrgnr").addEventListener("blur", function() {
    //kontroller at det kun er nummer
    if (!/^\d+$/.test(this.value)) {
        alert("Orgnr kan kun inneholde tall.");
        this.value = activeSupplier.orgnr || "";
        return;
    }


    // Lagre innholdet i databasen
    saveSupplierInfo(activeSupplier.airtable, {orgnr: this.value}); 

    // Lagre innholdet lokalt
    activeSupplier.orgnr = this.value;
});

document.getElementById("urltosupplierweb").addEventListener("blur", function() {
   
});

document.getElementById("saveLogoButton").addEventListener("click", function() {
    const imageElement = document.getElementById("logoImageSupplier");
    const imageURL = imageElement.src;  // Hent URL-en til bildet    
    
    // Lagre logo i databasen
    saveSupplierInfo(activeSupplier.airtable, {logo: imageURL});   

    // Lagre logo lokalt
    activeSupplier.logo = imageURL;
    
    // Deaktiver lagreknappen
    this.classList.remove("active");
}); 

document.getElementById("offerlable").addEventListener("blur", function() {

  // Lagre innholdet i databasen
  saveSupplierInfo(activeSupplier.airtable, {rabatt: this.value});

  //lagre lokalt
  activeSupplier.cuttext = this.value;
});

document.getElementById("saveshorttextButton").addEventListener("click", function () {     
     // Hent innholdet fra TinyMCE editoren
     let shortdescription = tinymce.get("shorttextArea").getContent();

    // Lagre innholdet i databasen
    saveSupplierInfo(activeSupplier.airtable, {kortinfo: shortdescription});

    //lagre lokalt
    activeSupplier.kortinfo = shortdescription;

    // Deaktiver lagreknappen
    document.getElementById("saveshorttextButton").classList.remove("active");
});

document.getElementById("shorttextArea").addEventListener("input", function () {

    // Aktiver lagreknappen
    document.getElementById("saveshorttextButton").classList.add("active");
})

document.getElementById("saveButton").addEventListener("click", function () {
    // Hent innholdet fra TinyMCE editoren
    var editorContent = tinymce.get("contentInfoelement").getContent();
    orginaltext = editorContent;
   
    if (document.getElementById("malonetextbutton").classList.contains("active")) {
        orginaltext = editorContent;
        document.getElementById("orginaltextbutton").click();
    } else {
    document.getElementById("orginaltextbutton").classList.add("active");
    document.getElementById("malonetextbutton").classList.remove("active");
    document.getElementById("saveButton").classList.remove("active");
    // Lagre innholdet i databasen
    saveSupplierInfo(activeSupplier.airtable, {info: editorContent});

    //lagre lokalt
    activeSupplier.info = editorContent;
    }

});

function saveSupplierInfo(supplierId, body) {

    patchAirtable("app1WzN1IxEnVu3m0","tblrHVyx6SDNljNvQ",supplierId,JSON.stringify(body),"responseSupplierDataUpdate");

}

function responseSupplierDataUpdate(data){
    console.log(data);
}

document.getElementById("malonetextbutton").addEventListener("click", function () {
    // Last inn innhold i TinyMCE
    loadContentIntoEditor(tinymce.get("contentInfoelement"),malonetext);

    // Fjern "active"-klassen fra "orginaltextbutton"
    document.getElementById("orginaltextbutton").classList.remove("active");

    // Legg til "active"-klassen på "malonetextbutton"
    this.classList.add("active");
    const saveButton = document.getElementById("saveButton");
    saveButton.textContent = "Kopier til gjeldende";
    saveButton.classList.add("active");
});

document.getElementById("orginaltextbutton").addEventListener("click", function () {
    loadContentIntoEditor(tinymce.get("contentInfoelement"),orginaltext);

    // Fjern "active"-klassen fra "orginaltextbutton"
    document.getElementById("malonetextbutton").classList.remove("active");

    // Legg til "active"-klassen 
    this.classList.add("active");

    document.getElementById("saveButton").textContent = "Lagre tekst";

});

function loadContentIntoEditor(element,htmlContent) {
    

    if (!element) {
        console.error("TinyMCE-editoren er ikke lastet inn ennå.");
        return;
    }

    // Sett HTML-innholdet i TinyMCE
    element.setContent(htmlContent);

    // 🚀 Juster høyden basert på innholdets faktiske størrelse
   // setTimeout(() => adjustEditorHeight(), 300); // Vent litt slik at innholdet rendres først
}

document.getElementById("urltosupplierweb").addEventListener("blur", function() {
    console.log("Brukeren er ferdig med å skrive URL:", this.value);
    validateAndSaveURL(this.value);
});

document.getElementById("testlinkbuttom").addEventListener("click", function(event) {
    event.preventDefault(); // Hindrer at linken går til #

    const urlInput = document.getElementById("urltosupplierweb").value.trim();

    if (!urlInput) {
        alert("Vennligst skriv inn en URL først.");
        return;
    }

    let finalURL = urlInput;
    
    // Sjekk om URL-en har http:// eller https://, hvis ikke legg til https://
    if (!finalURL.startsWith("http://") && !finalURL.startsWith("https://")) {
        finalURL = "https://" + finalURL;
    }

    console.log("Åpner link:", finalURL);
    window.open(finalURL, "_blank"); // Åpner linken i ny fane
});

function validateAndSaveURL(url) {
    url = url.trim(); // Fjerner mellomrom i starten og slutten

    // Hvis URL er tom, ikke gjør noe
    if (url === "") {
        return;
    }

    // Sjekk om URL starter med "http://" eller "https://"
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        alert("Vennligst skriv inn en gyldig URL som starter med http:// eller https://");
        return;
    }

    // Lagre innholdet i databasen
    saveSupplierInfo(activeSupplier.airtable, { landingsside: url });

    // Lagre lokalt
    activeSupplier.landingsside = url;
}

document.getElementById("uploadButton").addEventListener("click", function(event) {
    event.preventDefault(); 

    const widget = uploadcare.Widget("#uploadcareWidget");
    widget.openDialog().done(function(file) {
        file.done(function(info) {
            const optimizedImageURL = info.cdnUrl + "-/format/auto/-/quality/smart/";
            console.log("Optimalisert bilde URL:", optimizedImageURL);
            document.getElementById("presentationImageSupplier").src = optimizedImageURL;
            document.getElementById("saveImageButton").classList.add("active");
        });
    });
});

document.getElementById("saveImageButton").addEventListener("click", function() {
    const imageElement = document.getElementById("presentationImageSupplier");
    const imageURL = imageElement.src;  // Hent URL-en til bildet    
    
    // Lagre bildet i databasen
    saveSupplierInfo(activeSupplier.airtable, {frontbilde: imageURL});   

    // Lagre bildet lokalt
    activeSupplier.image = imageURL;

    // Deaktiver lagreknappen
    this.classList.remove("active");
}); 

document.getElementById("deliveryMethodSelector").addEventListener("change", function() {
    const selectedValue = this.value; // Hent den valgte verdien
    
    // Lagre valgt leveringsmetode i databasen
    saveSupplierInfo(activeSupplier.airtable, {output: [selectedValue]}); 
    
    //sjekk emnet og innholdet i mailen og legg til i databasen

    // Lagre valgt leveringsmetode lokalt
    activeSupplier.output = [selectedValue];

    // oppdater beskrivelse
    updateSupplierPage(activeSupplier);
});

document.getElementById("connectinMailAdress").addEventListener("blur", function() {
    // Lagre innholdet i databasen
    saveSupplierInfo(activeSupplier.airtable, {outputmail: this.value});

    // Lagre innholdet lokalt
    activeSupplier.outputmail = this.value;
});

document.getElementById("saveMailbodyButton").addEventListener("click", function() {
    const mailSubjectfield = document.getElementById("mailSubjectfieldinput").value;
    const mailbodyelement = tinymce.get("mailbodyelement").getContent();    

    // Lagre innholdet i databasen
    if(activeSupplier.output[0] === "recJV491g6P1iUl8u"){   
        saveSupplierInfo(activeSupplier.airtable, {emneselskap: mailSubjectfield, tilselskap: mailbodyelement});
    }else{
        saveSupplierInfo(activeSupplier.airtable, {emneleverandor: mailSubjectfield, tilleverandor: mailbodyelement});
    }

    // Deaktiver lagreknappen
    this.classList.remove("active");

    // Lagre innholdet lokalt
    if(activeSupplier.output[0] === "recJV491g6P1iUl8u"){
        activeSupplier.customersubjectmail = mailSubjectfield;
        activeSupplier.customermailbody = mailbodyelement;
    }
    else{
        activeSupplier.suppliersubjectmail = mailSubjectfield;
        activeSupplier.suppliermailbody = mailbodyelement;
    }
});

document.getElementById("uploadDocButton").addEventListener("click", function(event) {
    event.preventDefault(); // Hindrer standard knapp-oppførsel
    
    // Åpner Uploadcare-filvelgeren for kun PDF-filer
    const widget = uploadcare.Widget("#uploadcareDocWidget");
    widget.openDialog().done(function(file) {
        file.done(function(info) {
            uploadedDocURL = info.cdnUrl; // Lagre PDF-URL
            console.log("Opplastet PDF URL:", uploadedDocURL);
            
            // Gjør "Åpne dokument"-knappen synlig
            const openDocButton = document.getElementById("openDocButton");
            openDocButton.style.display = "inline-block";

            // Aktiver lagreknappen
            document.getElementById("saveDocButton").classList.add("active");
        });
    });
});

// 🔹 Når brukeren klikker "Åpne dokument", åpne PDF i ny fane
document.getElementById("openDocButton").addEventListener("click", function() {
    if (uploadedDocURL) {
        window.open(uploadedDocURL, "_blank"); // Åpner PDF i ny fane
    } else {
        alert("Ingen PDF lastet opp ennå.");
    }
});

document.getElementById("saveDocButton").addEventListener("click", function() { 
    // Lagre URL-en til PDF-en i databasen
    saveSupplierInfo(activeSupplier.airtable, {guidfil: uploadedDocURL});

    // Deaktiver lagreknappen
    this.classList.remove("active");
}); 

function adjustEditorHeight() {
    var editorInstance = tinymce.get("contentInfoelement");

    if (!editorInstance) return;

    // Finn TinyMCE sitt innholdselement
    var editorBody = editorInstance.getContentAreaContainer().querySelector("iframe");

    if (editorBody) {
        var newHeight = editorBody.contentWindow.document.body.scrollHeight + 20; // Legg til ekstra padding
        editorInstance.iframeElement.style.height = newHeight + "px"; // Oppdater høyde
    }
}

function ruteresponse(data,id){

    if(id == "supplierResponse"){
        supplierResponse(data);
    }else if(id == "responseSupplierDataUpdate"){
        responseSupplierDataUpdate(data);
    }else if(id == "moreInfoSupplierResponse"){
        moreInfoSupplierResponse(data);
    }else if(id == "respondconnections"){
        respondconnections(data);
    }else if(id == "responsNewSupplier"){
        responsNewSupplier(data);
    }else if(id == "responseDeleteSupplier"){
        responseDeleteSupplier(data);
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

            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}

function convertGroupJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
        try {
            
            // Parse JSON-strengen uten HTML-dataen
            const data = JSON.parse(jsonString);

            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}

function convertOutputJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
        try {
            
            // Midlertidig fjern `suppliermailbody`-feltet hvis det finnes
            let suppliermailbodyValue = '';
            if (jsonString.includes('"suppliermailbody":')) {       
                // Ekstraher `suppliermailbody`-feltet med en regex (forutsatt korrekt JSON-format)
                const suppliermailbodyMatch = jsonString.match(/"suppliermailbody":\s*"(.*?)"(,|\})/s);
                if (suppliermailbodyMatch) {
                    suppliermailbodyValue = suppliermailbodyMatch[1];  // Ekstraher verdien av `suppliermailbody`
                    jsonString = jsonString.replace(/"suppliermailbody":\s*".*?"(,|\})/s, '"suppliermailbody":""$1');  // Fjern HTML-innholdet midlertidig
                }
            }

            // Midlertidig fjern `suppliersubject`-feltet hvis det finnes
            let suppliersubjectValue = '';
            if (jsonString.includes('"suppliersubject":')) {
                // Ekstraher `suppliersubject`-feltet med en regex (forutsatt korrekt JSON-format)
                const suppliersubjectMatch = jsonString.match(/"suppliersubject":\s*"(.*?)"(,|\})/s);
                if (suppliersubjectMatch) {
                    suppliersubjectValue = suppliersubjectMatch[1];  // Ekstraher verdien av `suppliersubject`
                    jsonString = jsonString.replace(/"suppliersubject":\s*".*?"(,|\})/s, '"suppliersubject":""$1');  // Fjern HTML-innholdet midlertidig
                }
            }   


            //Midlertidig fjern `customersubjectmail`-feltet hvis det finnes
            let Kundetekstemnet = '';
            if (jsonString.includes('"customersubjectmail":')) {
                // Ekstraher `customersubjectmail`-feltet med en regex (forutsatt korrekt JSON-format)
                const KundetekstemnetMatch = jsonString.match(/"customersubjectmail":\s*"(.*?)"(,|\})/s);
                if (KundetekstemnetMatch) {
                    Kundetekstemnet = KundetekstemnetMatch[1];  // Ekstraher verdien av `customersubjectmail`
                    jsonString = jsonString.replace(/"customersubjectmail":\s*".*?"(,|\})/s, '"customersubjectmail":""$1');  // Fjern HTML-innholdet midlertidig    
                }
            }

            //Midlertidig fjern `customermailbody`-feltet hvis det finnes
            let Kundetekstbody = '';
            if (jsonString.includes('"customermailbody":')) {
                // Ekstraher `customermailbody`-feltet med en regex (forutsatt korrekt JSON-format)
                const KundetekstbodyMatch = jsonString.match(/"customermailbody":\s*"(.*?)"(,|\})/s);
                if (KundetekstbodyMatch) {
                    Kundetekstbody = KundetekstbodyMatch[1];  // Ekstraher verdien av `customermailbody`
                    jsonString = jsonString.replace(/"customermailbody":\s*".*?"(,|\})/s, '"customermailbody":""$1');  // Fjern HTML-innholdet midlertidig
                }
            }


            //Midlertidig fjern `description`-feltet hvis det finnes
            let descriptionValue = '';
            if (jsonString.includes('"description":')) {
                // Ekstraher `description`-feltet med en regex (forutsatt korrekt JSON-format)
                const descriptionMatch = jsonString.match(/"description":\s*"(.*?)"(,|\})/s);
                if (descriptionMatch) {
                    descriptionValue = descriptionMatch[1];  // Ekstraher verdien av `description`
                    jsonString = jsonString.replace(/"description":\s*".*?"(,|\})/s, '"description":""$1');  // Fjern HTML-innholdet midlertidig
                }
            }

            // Parse JSON-strengen uten HTML-dataen
            const data = JSON.parse(jsonString);

            // Legg tilbake `suppliermailbody`-feltet
            data.suppliermailbody = suppliermailbodyValue;
            data.suppliersubject = suppliersubjectValue;
            data.description = descriptionValue;
            data.customersubjectmail = Kundetekstemnet;
            data.customermailbody = Kundetekstbody;


            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}

tinymce.init({
    selector: '#contentInfoelement, #shorttextArea,#mailbodyelement', // 🚀 Initialiserer begge TinyMCE-feltene
    branding: false, // Fjerner "Build with TinyMCE"
    plugins: [
        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
        'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
    ],
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
    tinycomments_mode: 'embedded',
    tinycomments_author: 'Author name',
    mergetags_list: [
        { value: 'First.Name', title: 'First Name' },
        { value: 'Email', title: 'Email' },
    ],
    ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),

    // 🚀 Forskjellig høyde for hver editor
    init_instance_callback: function (editor) {
        if (editor.id === "contentInfoelement") {
            editor.getContainer().style.height = "550px"; // Setter høyde for contentInfoelement
        } else if (editor.id === "shorttextArea") {
            editor.getContainer().style.height = "250px"; // Setter høyde for shorttextArea
        }else if (editor.id === "mailbodyelement") {
            editor.getContainer().style.height = "250px"; // Setter høyde for shorttextArea
        }
        console.log(`TinyMCE lastet for ${editor.id} med høyde ${editor.getContainer().style.height}`);
    }, // ✅ Korrekt: Komma etter denne funksjonen!

    // 🚀 Setup for event listener
    setup: function (editor) {
        editor.on('change', function () {
            handleEditorChange(editor.id);
        });

        editor.on('input', function () {
            handleEditorChange(editor.id
            );  // Kjør funksjonen når innholdet endres
        });
    }
});

function handleEditorChange(editorId) {

    var editor = document.getElementById(editorId);
    editor.parentElement.querySelector(".savebuttontext").classList.add("active");
  
}

malonetext = `
<p><span style="font-size: 14pt;"><strong>Generell informasjon:</strong></span><br>
Vi har forhandlet frem en fastprisavtale for bedrifter på et utvalg av produkter og tjenester fra <strong>{leverandørnavn}</strong>. 
Denne avtalen sikrer konkurransedyktige priser, også i høysesong, slik at din bedrift kan oppnå besparelser og forutsigbarhet i kostnader.
</p>

<p>I tillegg har vi sikret <strong>{rabatt_prosent}%</strong> rabatt på hele sortimentet for ansatte, slik at de også kan dra nytte av gunstige betingelser.</p>

<h3><span style="font-size: 14pt;"><strong>Fordeler med avtalen:</strong></span></h3>
<ul>
  <li><strong>Fastpriser</strong> på et utvalg {produktkategori}</li>
  <li><strong>Forutsigbarhet</strong> – sikre deg lave priser også i høysesong</li>
  <li><strong>Avtalenummer (AWD): {avtalenummer}</strong> – enkelt å benytte rabatten ved bestilling</li>
  <li><strong>Tilgang til bedriftskonto</strong> – mulighet for å knytte {betalingsløsning} til en felles bedriftskonto som kan benyttes av alle ansatte</li>
  <li><strong>Enkel registrering</strong> – en guide for opprettelse av bedriftskonto er vedlagt</li>
</ul>

<h3><strong>Hvordan komme i gang:</strong></h3>
<ol>
  <li><strong>Registrer deg</strong> ved å aktiver tilknytningsbryteren øverst til høyre på denne siden...</li>
  <li><strong>Bruk avtalenummeret {avtalenummer}</strong> ved bestilling for å sikre fastprisene og rabattene...</li>
  <li><strong>Del fordelen med dine ansatte</strong> – de kan opprette konto og benytte seg av rabatten...</li>
</ol>

<p>For spørsmål eller mer informasjon, kontakt <strong>{kontaktperson}</strong> - <strong>{kontaktinfo}</strong>.</p>
`;

document.getElementById("getconnectionsButton").addEventListener("click", function() { 
    getconnections(activeSupplier.airtable);
    document.getElementById("connectingList").style.display = "block";

});

function getconnections(supplierid){
   let body = airtablebodylistAND({supplierid:supplierid});
    Getlistairtable("app1WzN1IxEnVu3m0","tblLjCOdb9elLmKOb",body,"respondconnections");
}

function respondconnections(data){

    var cleandata = rawdatacleaner(data);
    // Fjern selskaper uten navn
    const cleanedList = cleandata.filter(company => 
        company.company && company.company.length > 0
    );
      
    startConnectionList(cleanedList);
}

function startConnectionList(data) {

    //sjekke at det er data
    if (!data || data.length === 0) {
        resetConnectionList();
        //se det i en alert
        alert("Ingen tilkoblede selskaper funnet.");
        return;
    }


    const list = document.getElementById("connectingList");
    if (!list) {
        console.error("List holder element not found");
        return;
    }

    list.replaceChildren(); // Rens listen før ny data legges til

    const elementLibrary = document.getElementById("elementlibrary");
    if (!elementLibrary) {
        console.error("Element library not found");
        return;
    }

    const nodeElement = elementLibrary.querySelector('.connecting');
    if (!nodeElement) {
        console.error("Template element not found");
        return;
    }

    // Bruk et sett for å lagre unike kombinasjoner av company[0] + supplier[0]
    const uniqueConnections = new Set();
    const filteredData = [];

    // Fjern duplikater
    data.forEach(connection => {
        const companyId = connection.company?.[0] || "";
        const supplierId = connection.supplier?.[0] || "";
        const uniqueKey = `${companyId}-${supplierId}`;

        if (!uniqueConnections.has(uniqueKey)) {
            uniqueConnections.add(uniqueKey);
            filteredData.push(connection);
        }
    });

    // Oppdater telleren for antall unike tilkoblinger
    document.getElementById("connectioncounter").textContent = filteredData.length + " stk. tilkoblede selskaper.";

    // Sorter data etter `lastmodified` (nyeste først)
    filteredData.sort((a, b) => new Date(b.lastmodified) - new Date(a.lastmodified));

    GlobalConnections = filteredData;
    // Populer listen med unike data
    filteredData.forEach((connection, index) => {
        const rowElement = nodeElement.cloneNode(true);

        // Legg til klasse for annenhver rad (alternating styles)
        if (index % 2 === 1) {
            rowElement.classList.add("pair");
        }

        // Populer raden med data
        rowElement.querySelector(".date").textContent = formatDate(connection.lastmodified) || "Ingen dato";
        rowElement.querySelector(".company").textContent = connection.companyname?.[0] || "";
        rowElement.querySelector(".person").textContent = connection.companybrukernavn?.[0] || "";

        // Legg til rad i listen
        list.appendChild(rowElement);
    });
}

function resetConnectionList() {
    document.getElementById("connectingList").replaceChildren();
    document.getElementById("connectioncounter").textContent = "0 stk. tilkoblede selskaper.";
}

function formatNameList(nameList) {
    if (Array.isArray(nameList)) {
        // Hvis det er en array, returner det første elementet med "..."
        return `${nameList[0].trim()}...`;
    } else if (typeof nameList === "string") {
        // Hvis det er en streng, splitt den på komma
        const names = nameList.split(',');
        return `${names[0].trim()} ...`;
    } else {
        console.error("Expected a string or array, but got:", nameList);
        return "Ukjent...";
    }
}

function formatDate(inputDate) {
    const months = [
        "jan", "feb", "mar", "apr", "mai", "jun",
        "jul", "aug", "sep", "okt", "nov", "des"
    ];

    const date = new Date(inputDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}.${month} ${year}`;
}

document.getElementById("xlsexportbutton").addEventListener("click", () => {
    // Feltene du vil hente
    const selectedFields = ["lastmodified", "companyorgnr", "companyname", "useremail", "companybrukernavn","companyuseremail"];

    // Mapping til nye navn
    const fieldMapping = {
        lastmodified: "Dato",
        companyorgnr: "Orgnummer",
        companyname: "Selskapsnavn",
        useremail: "Innsender",
        companybrukernavn: "Brukere",
        companyuseremail: "Bruker e-poster"
    };

    let filename = "Tilkoblinger for " + GlobalConnections[0].suppliername[0];

    // Eksporter til Excel
    exportData(GlobalConnections, selectedFields, fieldMapping, filename);
});
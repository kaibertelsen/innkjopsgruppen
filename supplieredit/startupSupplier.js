var gsuppliers = [];
var activeSupplier = {};
var malonetext;
var userid;
var maltotext;
var orginaltext = "";
var gGroups = [];
var gCategorys = [];
var gOutputs = [];
let uploadedDocURL = ""; // Variabel for å lagre URL-en til PDF-en
var GlobalConnections = [];
var gAttachments = [];

function getSuppier(){     
//hente leverandører
GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC","recwnwSGJ0GvRwKFU","supplierResponse","skipCache");
}

function supplierResponse(data){

    if (!data || !data.fields || !data.fields.supplierjson || !Array.isArray(data.fields.supplierjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields.supplierjson' som en array.");
        return; // Avbryt hvis data ikke er gyldig
    }

    //sjekke om data.feilds.superAdmin array inneholder min brukerid
    if(data.fields.superAdmin){
        if(data.fields.superAdmin.includes(userid)){
            document.getElementById("openNewsupplierwrapper").style.display = "block";
        }else{  
            return;
        }
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
        klient: ["recwnwSGJ0GvRwKFU"],
        creator: [userid]
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

    const elementLibrary = document.getElementById("elementlibrarywrapper");
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
    }else if(id == "responseAttachmentUpload"){
        responseAttachmentUpload(data);
    }

}

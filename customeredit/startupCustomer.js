var gsuppliers = [];
var activeCustomer = {};
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
var gCustomers = [];

function getCustomer(){     
//hente kunder
GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC","rec1QGUGBMVaqxhp1","customerResponse","skipCache");
}

function customerResponse(data){

    if (!data || !data.fields || !data.fields.membersjson || !Array.isArray(data.fields.membersjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields.supplierjson' som en array.");
        return; // Avbryt hvis data ikke er gyldig
    }

    //sjekke om data.feilds.superAdmin array inneholder min brukerid
    if(data.fields.superAdmin){
        if(data.fields.superAdmin.includes(userid)){
            
        }else{  
            return;
        }
    }

    // Konverter JSON-strenger til objekter
    const jsonStrings = data.fields.membersjson;
    
    let customers = convertCustomerJsonStringsToObjects(jsonStrings);
    gCustomers = customers;
    startupCustomerList(customers);

    const groups = data.fields.groupjson;
    gGroups = convertGroupJsonStringsToObjects(groups);
    loadeGroupSelector(gGroups);

}

function convertCustomerJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
        try {
            
            // Parse JSON-strengen uten HTML-dataen
            const data = JSON.parse(jsonString);


            // Sørg for at "group" og "category" alltid er arrays
            if (!data.cashflowjson) {
                data.cashflowjson = [];
            }

            if (!data.bruker) {
                data.bruker = [];
            }

            if (!data.invitasjon) {
                data.invitasjon = [];
            }

            if (!data.connection) {
                data.connection = [];
            }

            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}

function loadeGroupSelector(groups){
    //last inn kategorier i select supplierFilterGroup
    const listFilterGroupSelector = document.getElementById("listFilterGroupSelector");
    //sortere gruppene alfabetisk
    groups.sort((a, b) => a.Name.localeCompare(b.Name, 'no', { sensitivity: 'base' }));
    loadSelector(listFilterGroupSelector, groups, "airtable", "Name", "Alle grupper");

    const customerGroupSelector = document.getElementById("customerGroupSelector");
    loadSelector(customerGroupSelector, groups, "airtable", "Name", "Velg gruppe");
}

function loadSelector(select, data, value, text, defaultText) {
    // Tøm select
    select.innerHTML = "";

    // Legg til default-valg
    select.options.add(new Option(defaultText, ""));

    // Legg til valg
    data.forEach(item => {
        select.options.add(new Option(item[text], item[value]));
    });
}

document.getElementById("searchinput").addEventListener("input", function () {

    // Kjør startupSupplierList med de filtrerte leverandørene
    startupCustomerList(gCustomers);
});

//
function startupCustomerList(customers){
   // Filtrer
   customers = filterList(customers);

   // Sorter alfabetisk
   customers = sortList(customers);

   // List
   listDatainList(customers)

}

document.getElementById("listFilterGroupSelector").addEventListener("change", function() {
    startupCustomerList(gCustomers);
});

function filterList(data) {
    // Hent input-feltet og filterelementene
    const searchInput = document.getElementById("searchinput");
    const FilterGroup = document.getElementById("listFilterGroupSelector");

    if (!searchInput) {
        console.error("Fant ikke input-feltet med id 'searchinput'");
        return data;
    }

    if (!FilterGroup) {
        console.error("Fant ikke select-feltet med id 'supplierFilterGroup'");
        return data;
    }

    // Hent søketeksten og trim mellomrom
    const searchText = searchInput.value.trim().toLowerCase();

    // Hent valgt gruppefilter
    const selectedGroup = FilterGroup.value;

    return data.filter(item => {
        const matchesSearch = item.Name.toLowerCase().includes(searchText);
        
        // Sjekk om selectedGroup finnes i customer.group (som er en array av objekter)
        const matchesGroup = 
            selectedGroup === "" || selectedGroup === item.group;

        return matchesSearch && matchesGroup; // Må matche kriteriene
    });
}


function sortList(data) {
 
    // Sorter alfabetisk etter 'name'
    data.sort((a, b) => 
        a.Name.localeCompare(b.Name, 'no', { sensitivity: 'base' })
    );

    return data;
}

function listDatainList(data) {
    // Hent containeren for leverandører
    const listContainer = document.getElementById("listconteiner");
    if (!listContainer) {
        console.error("Ingen container funnet for visning av leverandører.");
        return;
    }

    // Tøm container
    listContainer.innerHTML = '';

    const elementLibrary = document.getElementById("elementlibrarywrapper");
    if (!elementLibrary) {
        console.error("Ingen 'elementlibrary' funnet.");
        return;
    }

    const nodeElement = elementLibrary.querySelector(".customer");
    if (!nodeElement) {
        console.error("Ingen '.supplier' funnet i 'elementlibrary'.");
        return;
    }

    // Sett counter
    const counter = document.getElementById("counterlist");
    counter.textContent = data.length + " stk.";
    counter.style.display = "block";

    data.forEach((item, index) => {
        const itemElement = nodeElement.cloneNode(true);
        itemElement.setAttribute("draggable", "true"); // Gjør elementet dra-bart
        itemElement.dataset.index = index; // Lagre original indeks
        itemElement.dataset.airtable = data.airtable; // Lagre Airtable-ID

        // Sett navn
        const name = itemElement.querySelector('.customername');
        if (name) name.textContent = item.Name || "Ukjent navn";

        // Legg til klikk-event for åpning
        const button = itemElement.querySelector('.openingbutton');
        if (button) {
            button.addEventListener("click", function () {
                openCustomer(item);
            });
        }

        // Legg til leverandøren i containeren
        listContainer.appendChild(itemElement);
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


function ruteresponse(data,id){

    if(id == "customerResponse"){
        customerResponse(data);
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
    }else if(id == "userResponse"){
        userResponse(data);
    }else if(id == "responseDeleteConnection"){
        responseDeleteConnection(data);
    }else if(id == "supplierResponse"){
        supplierResponse(data);
    }

}

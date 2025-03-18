document.getElementById("backtolistbutton").addEventListener("click", function () {
    document.getElementById("supplierListTagbutton").click();
});

function openCustomer(customer){

    activeCustomer = customer;

   
   
    //åpne 
    document.getElementById("itemTagbutton").click();

    const supplierPageConteiner = document.getElementById("supplierPageConteiner");

    const publicSwitsh = document.getElementById("publicSwitsh");
    publicSwitsh.checked = customer.inactive ? false : true;

    const publicSwitshtext = document.getElementById("publicSwitshtext");
    publicSwitshtext.textContent = customer.inactive ? "Deaktivert" : "Aktivert";
    
    const suppliernamepage = document.getElementById("supplierNameInput");
    suppliernamepage.value = customer.Name || "";

    const supplierNameOrgnr = document.getElementById("supplierNameOrgnr");
    supplierNameOrgnr.value = customer.orgnr || "";

    const supplierlogo = supplierPageConteiner.querySelector(".supplierlogo");
    supplierlogo.src = customer.logo || "https://cdn.prod.website-files.com/6346cf959f8b0bccad5075af/67c84fa2f53230648774dd1b_dummy-image-landscape-1024x585.jpg";

    const customerGroupSelector = document.getElementById("customerGroupSelector");
    //finner hvilke gruppe selskapet tilhører og velg den i selector
    customerGroupSelector.value = customer.group;


    /*
    const offerlable = document.getElementById("offerlable");
    offerlable.value = supplier.cuttext

    var shorttextArea = tinymce.get("shorttextArea");
    loadContentIntoEditor(shorttextArea,supplier.kortinfo);

    const contentInfoelement = tinymce.get("contentInfoelement");
    loadContentIntoEditor(contentInfoelement,supplier.info);
    orginaltext = supplier.info;

    loadAttachmentList(supplier.attachment);
    gAttachments = supplier.attachment;
    listGroups(supplier.group);

    listCategorys(supplier.category);

    const urltosupplierweb = document.getElementById("urltosupplierweb");
    urltosupplierweb.value = supplier.landingsside;

    const presentationImageSupplier = document.getElementById("presentationImageSupplier");
    presentationImageSupplier.src = supplier.image || "https://cdn.prod.website-files.com/6346cf959f8b0bccad5075af/67c84fa2f53230648774dd1b_dummy-image-landscape-1024x585.jpg";
    
    //last inn outputs i select
    const deliveryMethodSelector = document.getElementById("deliveryMethodSelector");
    deliveryMethodSelector.innerHTML = "";
    deliveryMethodSelector.options.add(new Option("Velg leveringsmetode", ""));
    gOutputs.forEach(output => {
        deliveryMethodSelector.options.add(new Option(output.Name, output.airtable));
    });

    */
  
}


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
            document.getElementById("logoImageCustomer").src = optimizedImageURL;
            document.getElementById("saveLogoButton").classList.add("active");
        });
    });
});

document.getElementById("saveLogoButton").addEventListener("click", function() {
    const imageElement = document.getElementById("logoImageCustomer");
    const imageURL = imageElement.src;  // Hent URL-en til bildet    
    
    // Lagre logo i databasen
    saveSupplierInfo(activeCustomer.airtable, {logourl: imageURL});   

    // Lagre logo lokalt
    activeCustomer.logo = imageURL;
    
    // Deaktiver lagreknappen
    this.classList.remove("active");
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



 



function saveSupplierInfo(itemId, body) {

    patchAirtable("app1WzN1IxEnVu3m0","tblFySDb9qVeVVY5c",itemId,JSON.stringify(body),"responseSupplierDataUpdate");

}

function responseSupplierDataUpdate(data){
    console.log(data);
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
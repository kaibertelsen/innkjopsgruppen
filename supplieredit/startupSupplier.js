var gsuppliers = [];
var activeSupplier = {};
var malonetext;
var maltotext;
var orginaltext = "";
var gGroups = [];
var gCategorys = [];
var gOutputs = [];

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
    startupSupplierList(suppliers);

    const groups = data.fields.groupjson;
    gGroups = convertGroupJsonStringsToObjects(groups);

    const categorys = data.fields.categoryjson;
    gCategorys = convertGroupJsonStringsToObjects(categorys);

    const outputs = data.fields.outputjson;
    gOutputs = convertOutputJsonStringsToObjects(outputs);


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
    const supplierFilterSelector = document.getElementById("supplierFilterSelector");

    if (!searchInput) {
        console.error("Fant ikke input-feltet med id 'searchinput'");
        return suppliers;
    }

    if (!supplierFilterSelector) {
        console.error("Fant ikke select-feltet med id 'supplierFilterSelector'");
        return suppliers;
    }

    // Hent søketeksten og trim mellomrom
    const searchText = searchInput.value.trim().toLowerCase();
    // Hent valgt filterkategori
    const selectedFilter = supplierFilterSelector.value;

    return suppliers.filter(supplier => {
        const matchesSearch = supplier.name.toLowerCase().includes(searchText);
        const matchesFilter =
            selectedFilter === "" || // Hvis "Alle" er valgt, vis alt
            (selectedFilter === "visible" && !supplier.hidden) || // Synlig leverandør
            (selectedFilter === "hidden" && supplier.hidden); // Skjult leverandør

        return matchesSearch && matchesFilter; // Må matche begge kriteriene
    });
}

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

/*
function listSuppliersinList(suppliers){

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
        console.error("Ingen '.suppliercard' funnet i 'elementlibrary'.");
        return;
    }

    //sette counter
    const counter = document.getElementById("counterlist");
    counter.textContent = suppliers.length+"skt.";
    counter.style.display = "block";
    
    suppliers.forEach(supplier => {
        const supplierElement = nodeElement.cloneNode(true);

        // Sett navn
        const name = supplierElement.querySelector('.suppliername');
        if (name) name.textContent = supplier.name || "Ukjent navn";
        
        // Sett navn
        const sortnr = supplierElement.querySelector('.sortnr');
        if (sortnr) sortnr.textContent = supplier.sortering || "Ukjent navn";

        //leg til klikk event for knapp
        const button = supplierElement.querySelector('.openingbutton');
        button.addEventListener("click", function() {
            // Kjør funksjonen med den aktive leverandørlisten
            openSupplier(supplier);
        });

        // Legg til leverandøren i containeren
        supplierContainer.appendChild(supplierElement);
    });

    
}
*/
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
        if (sortnr) sortnr.textContent = supplier.sortering || "0";
        

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

}

// 🔹 Funksjon for når dra-operasjonen er ferdig
function handleDragEnd(event) {
    event.target.classList.remove("dragging");
}
////open leverandøren

function openSupplier(supplier){

    activeSupplier = supplier;

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
    
    const suppliernamepage = supplierPageConteiner.querySelector(".suppliernamepage");
    suppliernamepage.textContent = supplier.name;

    const supplierlogo = supplierPageConteiner.querySelector(".supplierlogo");
    supplierlogo.src = supplier.logo;

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
    presentationImageSupplier.src = supplier.image || "path/to/default/image.png";
    
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
   
    if(data.fields.emneleverandor){
        activeSupplier.subjectmail = data.fields.emneleverandor;
    }

   if(data.fields.tilleverandor){   
    activeSupplier.bodymail = data.fields.tilleverandor;
   }

   //opdater leverandøren
   updateSupplierPage(activeSupplier);
}

function updateSupplierPage(supplier){
    //tillegsinformasjon leverandør

    // FINN RIKTIG Option-element basert på supplier.output og sett den som valgt
    const deliveryMethodSelector = document.getElementById("deliveryMethodSelector");
    deliveryMethodSelector.value = supplier.output || "";

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
// Toggling av "active"-klassen på den klikkede knappen

    if (button.classList.contains("active")) {
        button.classList.remove("active"); // Fjern klassen hvis den allerede er satt
    } else {
        button.classList.add("active"); // Legg til klassen hvis den ikke er satt
    }
    // Hent alle aktive kategorier
    const activeCategorys = Array.from(allButtons).filter(button => button.classList.contains("active"));   
    const activeCategorysid = activeCategorys.map(category => category.dataset.categoryid);
    saveSupplierInfo(activeSupplier.airtable, {kategoriers: activeCategorysid});

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
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        alert("Vennligst skriv inn en gyldig URL som starter med http:// eller https://");
        return;
    }
     // Lagre innholdet i databasen
  saveSupplierInfo(activeSupplier.airtable, {landingsside: this.value});

  //lagre lokalt
  activeSupplier.landingsside = this.value;

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


            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}







tinymce.init({
    selector: '#contentInfoelement, #shorttextArea', // 🚀 Initialiserer begge TinyMCE-feltene
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
        }
        console.log(`TinyMCE lastet for ${editor.id} med høyde ${editor.getContainer().style.height}`);
    }, // ✅ Korrekt: Komma etter denne funksjonen!

    // 🚀 Setup for event listener
    setup: function (editor) {
        editor.on('change', function () {
            handleEditorChange(editor.id);
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

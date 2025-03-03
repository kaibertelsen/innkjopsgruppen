var gsuppliers = [];
var activeSupplier = {};
var malonetext;
var maltotext;
var orginaltext = "";

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

function openSupplier(supplier){

    activeSupplier = supplier;
    console.log(supplier);
    //åpne leverandørsiden
    document.getElementById("supplierTagbutton").click();

    const supplierPageConteiner = document.getElementById("supplierPageConteiner");
    

    const suppliernamepage = supplierPageConteiner.querySelector(".suppliernamepage");
    suppliernamepage.textContent = supplier.name;

    const supplierlogo = supplierPageConteiner.querySelector(".supplierlogo");
    supplierlogo.src = supplier.logo;

    const shortdescription = supplierPageConteiner.querySelector(".shortdescription");
    shortdescription.textContent = supplier.kortinfo;

    const contentInfoelement = supplierPageConteiner.querySelector(".contentInfoelement");
    loadContentIntoEditor(supplier.info);
    orginaltext = supplier.info;
  
}
document.getElementById("saveshorttextButton").addEventListener("click", function () {     
    let shortdescription = document.getElementById("shorttextArea").value;   
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
    loadContentIntoEditor(malonetext);

    // Fjern "active"-klassen fra "orginaltextbutton"
    document.getElementById("orginaltextbutton").classList.remove("active");

    // Legg til "active"-klassen på "malonetextbutton"
    this.classList.add("active");
    const saveButton = document.getElementById("saveButton");
    saveButton.textContent = "Kopier til gjeldende";
    saveButton.classList.add("active");
});

document.getElementById("orginaltextbutton").addEventListener("click", function () {
    loadContentIntoEditor(orginaltext);

    // Fjern "active"-klassen fra "orginaltextbutton"
    document.getElementById("malonetextbutton").classList.remove("active");

    // Legg til "active"-klassen 
    this.classList.add("active");

    document.getElementById("saveButton").textContent = "Lagre tekst";

});

function loadContentIntoEditor(htmlContent) {
    var editorInstance = tinymce.get("contentInfoelement");

    if (!editorInstance) {
        console.error("TinyMCE-editoren er ikke lastet inn ennå.");
        return;
    }

    // Sett HTML-innholdet i TinyMCE
    editorInstance.setContent(htmlContent);

    // 🚀 Juster høyden basert på innholdets faktiske størrelse
   // setTimeout(() => adjustEditorHeight(), 300); // Vent litt slik at innholdet rendres først
}

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

tinymce.init({
    selector: '#contentInfoelement', // Må ha # her
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

    // 🚀 Setup for event listener
    setup: function (editor) {
        editor.on('input', function () {
            console.log("Brukeren har skrevet noe i TinyMCE!");
            handleEditorChange();
        });

        editor.on('change', function () {
            console.log("Innholdet i TinyMCE ble endret!");
            handleEditorChange();
        });
    }
});

// 🔹 Funksjon som kjører hver gang brukeren endrer noe
function handleEditorChange() {
    console.log("Editor-innholdet er endret! Kan kjøre lagring eller oppdatering her.");
    // Her kan du f.eks. aktivere en "Lagre"-knapp eller oppdatere forhåndsvisning
    document.getElementById("saveButton").classList.add("active");
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

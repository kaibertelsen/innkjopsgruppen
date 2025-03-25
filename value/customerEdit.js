function placeEditorWrapperBack() {
    // Finn elementet med ID "editornewwrapper"
    const editorWrapper = document.getElementById("editornewwrapper");
    // Finn elementet med ID "listparrentholder"
    const orginalPlaceParent = document.getElementById("listparrentholder");

    // Sjekk om begge elementene eksisterer
    if (editorWrapper && orginalPlaceParent) {
        // Legg editorWrapper som et barn av orginalPlaceParent
        orginalPlaceParent.appendChild(editorWrapper);
        console.log("editorWrapper er plassert tilbake i orginalPlaceParent.");
    } else {
        if (!editorWrapper) {
            console.error("Elementet med ID 'editornewwrapper' ble ikke funnet.");
        }
        if (!orginalPlaceParent) {
            console.error("Elementet med ID 'listparrentholder' ble ikke funnet.");
        }
    }
}


const searchInputCs = document.getElementById("searchSupplierCompanysettings");
const dropdownCs = document.getElementById("dropdownCompanysettings");

const cutInput = document.getElementById("cutvalueInput");
cutInput.style.display = "none";

const selector = document.getElementById("groupCutcompanySelector");
selector.style.display = "none";

const saveCompanySettings = document.getElementById("saveCompanySettings");
saveCompanySettings.style.display = "none";

searchInputCs.addEventListener("input", function () {
    const searchTerm = searchInputCs.value.toLowerCase().trim();
    dropdownCs.innerHTML = ""; // Tøm tidligere treff

    if (searchTerm.length === 0) {
        dropdownCs.style.display = "none";
        return;
    }

    const matches = supplierlistbuffer.filter(supplier => {
        const name = (supplier.name || "").toLowerCase();
        const altName = (supplier.leverandornavn || "").toLowerCase();
        return name.includes(searchTerm) || altName.includes(searchTerm);
    });

    if (matches.length === 0) {
        dropdownCs.style.display = "none";
        return;
    }

    matches.forEach(supplier => {
        const item = document.createElement("div");
        item.classList.add("dropdown-item");
        item.textContent = supplier.name || supplier.leverandornavn;
        item.addEventListener("click", () => {
            searchInputCs.value = supplier.name || supplier.leverandornavn;
            dropdownCs.innerHTML = "";
            dropdownCs.style.display = "none";
            companySupplierSearch(supplier);
        });
        dropdownCs.appendChild(item);
    });

    dropdownCs.style.display = "block";
});


function companySupplierSearch(supplier) {
    //Sjekke om denne leverandøren har en standard rabatt
    if (supplier.defaultcut) {
        //sett input number til default rabatt
        const cutInput = document.getElementById("cutvalueInput");
        cutInput.value = supplier.defaultcut * 100 + "%";
        cutInput.style.display = "block";

        //gjøre selector
            const selector = document.getElementById("groupCutcompanySelector");
            selector.style.display = "block";
            //
            const saveCompanySettings = document.getElementById("saveCompanySettings");
            saveCompanySettings.style.display = "inline-block";

        //sjekke om leverandøren har volumrabetter
        if(!supplier.quantity){
            //har ikke mengderabatter
            const selector = document.getElementById("groupCutcompanySelector");
            selector.value = 1;
            selector.disabled = true;
        }else{
            //har mengderabatter
            const selector = document.getElementById("groupCutcompanySelector");
            selector.disabled = false;
        
        }
    console.log(supplier);
    }
}

const cutInputCp = document.getElementById("cutvalueInput");

cutInputCp.addEventListener("input", function () {
    let rawValue = this.value;

    // Tillat bare tall og ett desimaltegn (punktum eller komma)
    rawValue = rawValue.replace(/[^0-9.,]/g, "");

    // Hvis både punktum og komma finnes, fjern den ene
    if ((rawValue.match(/[.,]/g) || []).length > 1) {
        rawValue = rawValue.slice(0, -1); // fjern siste tegn
    }

    // Normaliser til punktum som desimaltegn
    rawValue = rawValue.replace(",", ".");

    // Hvis tomt, resett og avslutt
    if (rawValue === "") {
        this.value = "";
        return;
    }

    // Sett på riktig enhet
    const selector = document.getElementById("groupCutcompanySelector");
    const selectedValue = selector.value;
    let displayValue = rawValue;

    switch (selectedValue) {
        case "1":
            displayValue += "%";
            break;
        case "2":
            displayValue += "øre/l";
            break;
        case "3":
            displayValue += "kr/m³";
            break;
        default:
            console.error("Ugyldig valg");
    }

    this.value = displayValue;
});



const groupSettingSelect = document.getElementById("groupCutcompanySelector");

groupSettingSelect.addEventListener("change", function () {
    const selectedValue = this.value;
    const selectedText = this.options[this.selectedIndex].text;

    console.log("Valgt verdi:", selectedValue);
    console.log("Valgt tekst:", selectedText);

    // Din funksjon basert på valget
    handleGroupSelection(selectedValue);
});

function handleGroupSelection(value) {
    switch (value) {
        case "1":
            console.log("Vis felt for prosentbesparelse");
            cutInputCp.value = "%";
            break;
        case "2":
            console.log("Vis felt for besparelse per liter");
            cutInputCp.value = "øre/l";
            break;
        case "3":
            console.log("Vis felt for besparelse per m³");
            cutInputCp.value = "kr/m³";
            break;
        default:
            console.log("Ugyldig valg");
    }
}

document.getElementById("saveCompanySettings").addEventListener("click", function () {
    const cutValue = cutInputCp.value;
    const supplierName = searchInputCs.value;
    const supplier = supplierlistbuffer.find(supplier => supplier.name === supplierName);
    const cutValueNumber = parseFloat(cutValue.replace(/[^\d.]/g, ""));
    const cutValueText = cutValue.replace(/\d/g, "");
    const cutValueFinal = cutValueNumber;


    const saveBody = {
            "company": [SelectedCompanyInFirstTab.airtable],
            "supplier": [supplier.airtable],
            "cut": cutValueFinal,
            "group": groupSettingSelect.value,
            "user": [userairtableid]
    };

    //sjekke om sleskapet har en array med flere settinger
    let companycutsettings = SelectedCompanyInFirstTab.cutsettings || [];
    companycutsettings.push(saveBody);
    SelectedCompanyInFirstTab.cutsettings = companycutsettings;

    //lager på server for selskapet
    POSTairtable("app1WzN1IxEnVu3m0","tbljS13MOpiiyCWPJ",JSON.stringify(saveBody),"respondCompanyCutSettings");
    
    //Lukk dropdown
    dropdownCs.innerHTML = "";
    dropdownCs.style.display = "none";
    cutInputCp.value = "";
    cutInputCp.style.display = "none";
    selector.style.display = "none";
    saveCompanySettings.style.display = "none";
});

function respondCompanyCutSettings(data){
    console.log(data);
}
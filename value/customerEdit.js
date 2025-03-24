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

const cutInputCp = document.getElementById("cutvalueInput");

cutInputCp.addEventListener("input", function () {
    let value = this.value.replace(/[^\d]/g, ""); // Fjern alt som ikke er tall
    if (value === "") {
        this.value = "";
        return;
    }

    //setter på ending etter hva som er valgt i selector
    const selector = document.getElementById("groupCutcompanySelector");
    const selectedValue = selector.value;
    switch (selectedValue) {
        case "1":
            value = value + "%";
            break;
        case "2":
            value = value + "øre/l";
            break;
        case "3":
            value = value + "kr/m³";
            break;
        default:
            console.error("Ugyldig valg");
    }

    this.value = value;

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
            break;
        case "2":
            console.log("Vis felt for besparelse per liter");
            break;
        case "3":
            console.log("Vis felt for besparelse per m³");
            break;
        default:
            console.log("Ugyldig valg");
    }
}

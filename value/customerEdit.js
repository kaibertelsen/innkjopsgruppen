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
            console.log("Valgt leverandør:", supplier);
        });
        dropdownCs.appendChild(item);
    });

    dropdownCs.style.display = "block";
});

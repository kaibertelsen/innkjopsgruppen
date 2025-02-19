function loadFilter() {
    const elementLibrary = document.getElementById("elementlibrary");
    if (!elementLibrary) {
        console.error("Ingen 'elementlibrary' funnet.");
        return;
    }
    const nodeElement = elementLibrary.querySelector(".categoributton");

    //categori
    const listc = document.getElementById("categorilist");
    loadFilterdata(listc,categories,nodeElement);

    //områder
    //const lista = document.getElementById("areaslist");
    //loadFilterdata(lista,areas,nodeElement);

}

function loadFilterdata(list,data,nodeElement){

    // Tøm listen
    list.innerHTML = '';

    const elementLibrary = document.getElementById("elementlibrary");
    if (!elementLibrary) {
        console.error("Ingen 'elementlibrary' funnet.");
        return;
    }

    data.forEach((categori, index) => {
        const categoriElement = nodeElement.cloneNode(true);
        categoriElement.textContent = categori.name;
        categoriElement.dataset.airtable = categori.airtable;

        // Legg til klassen "active" på første element
        if (index === 0) {
            categoriElement.classList.add("active");
        }

        // Legg til eventlistener for å trigge funksjonen ved klikk
        categoriElement.addEventListener("click", function() {
            categoriFilterTriggered(categoriElement);
        });

        list.appendChild(categoriElement);
    });

}

function categoriFilterTriggered(button) {
    const allButtons = button.parentElement.querySelectorAll(".categoributton");

    // Sjekk om dataset.airtable er tom
    if (!button.dataset.airtable) {
        // Legg til klassen "active" på knappen som ble klikket
        button.classList.add("active");

        // Fjern klassen "active" fra alle andre knapper
        allButtons.forEach(otherButton => {
            if (otherButton !== button) {
                otherButton.classList.remove("active");
            }
        });
    } else {
        // Fjern klassen "active" fra knappen med tom airtable-nøkkel
        allButtons.forEach(otherButton => {
            if (!otherButton.dataset.airtable) {
                otherButton.classList.remove("active");
            }
        });

        // Toggling av "active"-klassen på den klikkede knappen
        if (button.classList.contains("active")) {
            button.classList.remove("active"); // Fjern klassen hvis den allerede er satt

            // Sjekk om ingen andre knapper har klassen "active"
            const hasActiveButton = Array.from(allButtons).some(otherButton => 
                otherButton.classList.contains("active")
            );

            // Hvis ingen andre knapper har klassen "active", sett klassen på knappen med tom airtable-verdi
            if (!hasActiveButton) {
                const defaultButton = Array.from(allButtons).find(otherButton => !otherButton.dataset.airtable);
                if (defaultButton) {
                    defaultButton.classList.add("active");
                }
            }
        } else {
            button.classList.add("active"); // Legg til klassen hvis den ikke er satt
        }
    }

    // Kall funksjonen for å liste leverandører basert på aktiv filtrering
    listSuppliers(activeSupplierList);
}

function isFilterActive(toggleButton) {
    
    const listc = document.getElementById("categorilist");
    let categoriOn = isFilterActiveSub(listc);

    const lista = document.getElementById("areaslist");
    let areaOn =isFilterActiveSub(lista);
    
    if(categoriOn || areaOn){
        //det er et aktivt filter
    }else{
        toggleButton.classList.remove("active");
    }
}

function isFilterActiveSub(list){

    const allButtons = list.querySelectorAll(".categoributton");
    // Sjekk om noen knapper har en `airtable`-verdi og klassen `active`
    const hasActiveFilter = Array.from(allButtons).some(button => {
    return button.dataset.airtable && button.classList.contains("active");
    });

    // Hvis en slik knapp ikke finnes, fjern klassen "active" fra `toggleButton`
    if (hasActiveFilter) {
        return true;
    }else{
        return false;
    }

}

function clearFilter(){

    const listc = document.getElementById("categorilist");
    resetFilterList(listc);
    //const lista = document.getElementById("areaslist");
    //resetFilterList(lista);

    listSuppliers(activeSupplierList);
}

function resetFilterList(list) {
    // Finn alle knapper i listen
    const allButtons = list.querySelectorAll(".categoributton");

    // Fjern klassen "active" fra alle knapper
    allButtons.forEach(button => button.classList.remove("active"));

    // Finn knappen med tom dataset.airtable
    const defaultButton = Array.from(allButtons).find(button => !button.dataset.airtable);

    // Sett klassen "active" på knappen med tom dataset.airtable, hvis den finnes
    if (defaultButton) {
        defaultButton.classList.add("active");
    }
}

function filterSupplierListCategory(data) {
    const list = document.getElementById("categorilist");

    // Finn alle knapper med klassen "active"
    const activeButtons = Array.from(list.querySelectorAll(".categoributton.active"));

    // Sjekk om en av de aktive knappene har tom dataset.airtable
    const hasDefaultButton = activeButtons.some(button => !button.dataset.airtable);

    // Hvis det finnes en knapp med tom dataset.airtable, returner hele data ufiltrert
    if (hasDefaultButton) {
        return data;  // Ingen filtrering
    }

    // Hent alle aktive `airtable`-verdier fra knappene
    const activeCategories = activeButtons.map(button => button.dataset.airtable);

    // Filtrer leverandører basert på om de har minst én kategori som matcher de aktive kategoriene
    const filteredSuppliers = data.filter(supplier => {
        if (Array.isArray(supplier.category)) {
            // Sjekk om leverandørens kategorier har en matching `airtable`-verdi
            return supplier.category.some(cat => cat.airtable && activeCategories.includes(cat.airtable));
        }
        return false;
    });


    return filteredSuppliers;
}

function filterSupplierListAreas(data) {
    const list = document.getElementById("areaslist");

    // Finn alle knapper med klassen "active"
    const activeButtons = Array.from(list.querySelectorAll(".categoributton.active"));

    // Sjekk om en av de aktive knappene har tom dataset.airtable
    const hasDefaultButton = activeButtons.some(button => !button.dataset.airtable);

    // Hvis det finnes en knapp med tom dataset.airtable, returner hele data ufiltrert
    if (hasDefaultButton) {
        return data;  // Ingen filtrering
    }

    // Hent alle aktive `airtable`-verdier fra knappene
    const activeAreas = activeButtons.map(button => button.dataset.airtable);

    // Filtrer leverandører basert på om `omradet` finnes i de aktive områdene
    const filteredSuppliers = data.filter(supplier => {
        return supplier.omradet && activeAreas.includes(supplier.omradet);
    });

    return filteredSuppliers;
}

function filterSupplierListsearchField(data) {
    // Hent søkeverdien fra søkefeltet
    const searchInput = document.getElementById("searchinput");
    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';

    // Filtrer data basert på "name", "category.name" eller "kortinfo" som matcher søkeverdien
    let filteredData = data.filter(supplier => {
        // Sjekk om leverandørens navn matcher søkeverdien
        const nameMatch = supplier.name.toLowerCase().includes(searchValue);

        // Sjekk om noen kategorier i supplier.category matcher søkeverdien
        const categoryMatch = Array.isArray(supplier.category) &&
            supplier.category.some(cat => cat.name.toLowerCase().includes(searchValue));

        // Sjekk om kortinfo matcher søkeverdien
        const kortinfoMatch = supplier.kortinfo && supplier.kortinfo.toLowerCase().includes(searchValue);

        // Returner true hvis enten navn, kategorier eller kortinfo matcher
        return nameMatch || categoryMatch || kortinfoMatch;
    });

    return filteredData;
}

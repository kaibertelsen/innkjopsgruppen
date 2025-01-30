function loadFilter() {
    const list = document.getElementById("categorilist");

    // Tøm listen
    list.innerHTML = '';

    const elementLibrary = document.getElementById("elementlibrary");
    if (!elementLibrary) {
        console.error("Ingen 'elementlibrary' funnet.");
        return;
    }

    const nodeElement = elementLibrary.querySelector(".categoributton");
    if (!nodeElement) {
        console.error("Ingen 'categoributton' funnet i 'elementlibrary'.");
        return;
    }
    categories.forEach((categori, index) => {
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
        } else {
            button.classList.add("active"); // Legg til klassen hvis den ikke er satt
        }
    }

    // Kall funksjonen for å liste leverandører basert på aktiv filtrering
    listSuppliers(activeSupplierList);
}

function isFilterActive(toggleButton) {
    const list = document.getElementById("categorilist");
    const allButtons = list.querySelectorAll(".categoributton");

    // Sjekk om noen knapper har en `airtable`-verdi og klassen `active`
    const hasActiveFilter = Array.from(allButtons).some(button => {
        return button.dataset.airtable && button.classList.contains("active");
    });

    // Hvis en slik knapp ikke finnes, fjern klassen "active" fra `toggleButton`
    if (!hasActiveFilter) {
        toggleButton.classList.remove("active");
    }
}
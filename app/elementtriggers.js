document.getElementById("logobutton").addEventListener("click", function() {
    location.reload();
});

document.getElementById("filtermydealsbutton").addEventListener("click", function() {
    this.classList.toggle("active"); // Legger til eller fjerner klassen "active"
    listSuppliers(activeSupplierList);
});

// Lytt til 'input'-hendelsen på søkefeltet
document.getElementById("searchinput").addEventListener("input", () => {
    // Kjør funksjonen med den aktive leverandørlisten
    listSuppliers(activeSupplierList);
});

const filterViewElement = document.getElementById("filterviewelement");
const toggleButton = document.getElementById("filterlistbutton");
let openfrombutton = false;

//alle klikk
document.addEventListener("click", function(event) {
    // Sjekk om elementet er trigget av egen knapp
    if (!openfrombutton) {
        // Hvis klikket skjer utenfor filterviewelement
        if (!filterViewElement.contains(event.target)) {
            // Skjul elementet
            filterViewElement.style.height = "0px"; // Kollaps tilbake
            toggleButton.classList.remove("active");
        }
    }
    
});

// Sett starttilstand
filterViewElement.style.height = "0px";
filterViewElement.style.overflow = "hidden"; // Sikre at innholdet ikke vises når høyden er 0
filterViewElement.style.transition = "height 0.3s ease-in-out"; // Legg til animasjon

toggleButton.addEventListener("click", function () {
    if (filterViewElement.style.height === "0px" || filterViewElement.style.height === "") {
        filterViewElement.style.height = filterViewElement.scrollHeight + "px"; // Utvid til innholdets høyde
        toggleButton.classList.add("active");
        openfrombutton = true;
        setTimeout(() => {
            //reset slik at den kan lukkes når en trykker utenfor filter view
            openfrombutton = false;
        }, 500);
        
    } else {
        filterViewElement.style.height = "0px"; // Kollaps tilbake
        toggleButton.classList.remove("active");
        
    }
});



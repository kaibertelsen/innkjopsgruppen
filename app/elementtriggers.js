document.getElementById("logobutton").addEventListener("click", function() {
    location.reload();
});


const filterViewElement = document.getElementById("filterviewelement");
const toggleButton = document.getElementById("filterlistbutton");
let buttonTrigger = false;

document.addEventListener("click", function(event) {
    // Sjekk om elementet er trigget av egen knapp
    if (buttonTrigger) {
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
        if (filterViewElement.style.height === "0px") {
            filterViewElement.style.height = filterViewElement.scrollHeight + "px"; // Utvid til innholdets høyde
            toggleButton.classList.add("active");
            buttonTrigger = true;
        } else {
            filterViewElement.style.height = "0px"; // Kollaps tilbake
            toggleButton.classList.remove("active");
            buttonTrigger = false;
        }
});



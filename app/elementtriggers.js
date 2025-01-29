document.getElementById("logobutton").addEventListener("click", function() {
    location.reload();
});


function startUp(userid){
    GETairtable("app1WzN1IxEnVu3m0","tblMhgrvy31ihKYbr",userid,"userResponse");
}

document.addEventListener("click", function(event) {
    // Hent elementet
    const filterViewElement = document.getElementById("filterviewelement");
    
    // Sjekk om elementet finnes
    if (filterViewElement) {
        // Hvis klikket skjer utenfor filterviewelement
        if (!filterViewElement.contains(event.target)) {
            // Skjul elementet
            filterViewElement.style.display = "none";
        }
    }
});


    const filterViewElement = document.getElementById("filterviewelement");
    const toggleButton = document.getElementById("filterlistbutton");

    // Sett starttilstand
    filterViewElement.style.height = "0px";
    filterViewElement.style.overflow = "hidden"; // Sikre at innholdet ikke vises når høyden er 0
    filterViewElement.style.transition = "height 0.3s ease-in-out"; // Legg til animasjon

    toggleButton.addEventListener("click", function () {
        if (filterViewElement.style.height === "0px") {
            filterViewElement.style.height = filterViewElement.scrollHeight + "px"; // Utvid til innholdets høyde
        } else {
            filterViewElement.style.height = "0px"; // Kollaps tilbake
        }
    });



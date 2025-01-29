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

document.getElementById("filterlistbutton").addEventListener("click", function() {
    const filterViewElement = document.getElementById("filterviewelement");

    // Hvis elementet er skjult eller har høyde 0, utvid det
    if (!filterViewElement.style.height || filterViewElement.style.height === "0px") {
        filterViewElement.style.display = "block"; // Sikre at det vises
        filterViewElement.style.overflow = "hidden"; // Skjul innhold under animasjon
        filterViewElement.style.transition = "height 0.3s ease-in-out"; // Legg til animasjon
        filterViewElement.style.height = filterViewElement.scrollHeight + "px"; // Sett høyde til innholdets faktiske høyde

    } else {
        // Hvis elementet er synlig, skjul det med animasjon
        filterViewElement.style.height = "0px"; 

        // Etter at animasjonen er ferdig, sett display: none
        setTimeout(() => {
            filterViewElement.style.display = "none";
        }, 300); // 300ms = samme som animasjonen
    }
});


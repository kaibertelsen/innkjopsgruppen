
document.getElementById("logginbutton").addEventListener("click", function() {
    // Lagre verdien som en streng i sessionStorage
    sessionStorage.setItem("rootToApp", "true");
});

document.getElementById("creatUserButton").addEventListener("click", function() {
    // Lagre verdien som en streng i sessionStorage
    sessionStorage.setItem("rootToApp", "true");
    sessionStorage.setItem("startupEmployer", "true");
});

document.getElementById("gotolistview").addEventListener("click", function() {
    //registrere "onboarded" på brukeren
    registrerOnboarded();
    // Gå videre til listen
    document.getElementById("tablist").click();
});

document.getElementById("logobutton").addEventListener("click", function() {
    location.reload();
});

document.getElementById("filtermydealsbutton").addEventListener("click", function() {
    this.classList.toggle("active"); // Legger til eller fjerner klassen "active"
    listSuppliers(activeSupplierList);
});

document.getElementById("clearfilterbutton").addEventListener("click", function() {
   clearFilter();
});

document.getElementById("supplierpagebackbutton").addEventListener("click", function() {
    document.getElementById("tablist").click();
});

document.getElementById("companypagebackbutton").addEventListener("click", function() {
    document.getElementById("tablist").click();
});

document.getElementById("companypagebutton").addEventListener("click", function() {
    hideMenye();
    companyPageChosed(activeCompany);
});

document.getElementById("cardbutton").addEventListener("click", function() {
    loadmemberCard();
});

document.getElementById("closecardbutton").addEventListener("click", function() {
    loadmemberCard();
});

document.getElementById("savingmoneybutton").addEventListener("click", function() {
    savingMoney();
});

document.getElementById("savingpagebackbutton").addEventListener("click", function() {
    document.getElementById("tablist").click();
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
            isFilterActive(toggleButton);
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
        //laste inhold i filteret
    } else {
        filterViewElement.style.height = "0px"; // Kollaps tilbake
        //sjekke om filteret er activt
        isFilterActive(toggleButton);
    }
});

document.getElementById("viewlistLayoutbutton").addEventListener("click", function() {

    const listbutton = document.getElementById("viewlistLayoutbutton");
    listbutton.classList.add("active");

    const gridbutton = document.getElementById("viewgridLayoutbutton");
    gridbutton.classList.remove("active");


    mainlistElementClass = ".supplierlistelement";
    const supplierContainer = document.getElementById("supplierlist");
    supplierContainer.style.display = "block";
    listSuppliers(activeSupplierList);
});

document.getElementById("viewgridLayoutbutton").addEventListener("click", function() {
    this.classList.toggle("active"); // Legger til eller fjerner klassen "active"

    const listbutton = document.getElementById("viewlistLayoutbutton");
    listbutton.classList.remove("active");

    const gridbutton = document.getElementById("viewgridLayoutbutton");
    gridbutton.classList.add("active");

    mainlistElementClass = ".suppliercard";
    const supplierContainer = document.getElementById("supplierlist");
    supplierContainer.style.display = "grid";
    listSuppliers(activeSupplierList);
});

document.getElementById("companySelector").addEventListener("change", function () {
    // Hent verdien og teksten til det valgte alternativet
    const selector = document.getElementById("companySelector");
    const selectedValue = selector.value; // ID (airtable)
    const selectedText = selector.options[selector.selectedIndex].text; // Navn
    companyChange(selectedValue);
    companyPageChosed(activeCompany);
});

document.getElementById("createUserTabButton").addEventListener("click", function () {
    // Åpne bruker opprettingsvinduet
    document.getElementById("connectinguserTagButton").click();
});

document.getElementById("creatuserpagebackbutton").addEventListener("click", function() {
    document.getElementById("tablogin").click();
});
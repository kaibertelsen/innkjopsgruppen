
var klientdata = [];
var sumPorteCompanys = [];
var sumAbonnementCompanys = [];
var sumKickbackCompanys = []
var sumSupplierCompanys = [];

var salesCompany = [];
var exitCompany = [];

function getKlientdata(){
    let klientid = "rec1QGUGBMVaqxhp1";
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC",klientid,"klientresponse")
}

function klientresponse(data) {
    // Sjekk om data.fields.membersjson eksisterer og er en array
    if (!data || !data.fields || !data.fields.membersjson || !Array.isArray(data.fields.membersjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields.membersjson' som en array.");
        return;
    }

    // Hent arrayen og konverter JSON-strenger til objekter
    const jsonStrings = data.fields.membersjson;
    const objects = convertJsonStringsToObjects(jsonStrings);
    klientdata = objects;
    loaddSelectors(getUniqueGroups(objects))
    loadSelectorDates();

    loadDashboardporte(calculatingPorteDashboard(objects));
    loadDashboardsale(calculatingSaleDashboard(objects));
    loadLiquidityOverview(calculateMonthlyValues(objects));

    listCustomer(objects);
    
}

function formatToCurrency(value) {
    if (isNaN(value)) {
        throw new Error("Verdien må være et tall");
    }
    const roundedValue = Math.round(value); // Avrunder til nærmeste heltall
    const formattedValue = roundedValue.toLocaleString('no-NO'); // Legger til tusenskiller i norsk format
    return formattedValue;
}

function loadDashboardporte(data) {
    const sumkickback = (data.sumkickback)/1000;
    const countKickback = data.countKickback;
    let snittkickback = sumkickback/countKickback;

    const sumvaluegroup = (data.sumvaluegroup)/1000;
    const countValuegroup = data.countValuegroup;
    let snittValue = sumvaluegroup/countValuegroup;

    const countUniqueCompany = data.countUniqueCompany;
    const sumtotal = sumkickback + sumvaluegroup;

    // Bruk felles tellefunksjon
    animateCounter("dachboardportsumtotal", 0, sumtotal, "", " ");
    animateCounter("dachboardportsumcount", 0, countUniqueCompany, "");

    animateCounter("dachboardportvaluegroup", 0, sumvaluegroup, "", " ");
    animateCounter("dachboardportvaluegroupcount", 0, countValuegroup, "");
    animateCounter("dachboardportvaluegroupsnitt", 0, snittValue, "");
    
    animateCounter("dachboardportkickback", 0, sumkickback, "", " ");
    animateCounter("dachboardportkickbackcount", 0, countKickback, "");
    animateCounter("dachboardportkickbacksnitt", 0, snittkickback, "");


    //supplier
    
    let countSupplier = data.countSupplierCompany;
    let sumSupplier = data.sumSupplierCompany/1000;
    let snittSupplier = (data.sumSupplierCompany / countSupplier) / 1000;

    animateCounter("dachboardportvaluesupplier", 0, sumSupplier, "", " ");
    animateCounter("dachboardportvaluesuppliercount", 0, countSupplier, "", " ");
    animateCounter("dachboardportprocentsupplier", 0, snittSupplier, "", " ");

}

function loadDashboardsale(data) {

    let counttotal = data.total.count;
    
    let countsale = data.winning.count;
    let valuesale = (data.winning.valuegroup + data.winning.kickback)/1000;
    let procentsale = (countsale/counttotal)*100;

    let countexits = data.exit.count;
    let valueexits = (data.exit.valuegroup + data.exit.kickback)/1000;
    let procentexits = (countexits/counttotal)*100;

    let countstatus = countsale - countexits;
    let valuestatus = valuesale - valueexits;
    let procentstatus = (countstatus/counttotal)*100;

    // Bruk felles tellefunksjon for animasjon
    animateCounter("dachboardcountsale", 0, countsale, "", "");
    animateCounter("dachboardvaluesale", 0, valuesale, "", "");
    animateCounter("dachboardprocentsale", 0, procentsale, "", "");
    

    animateCounter("dachboardcountexits", 0, countexits, "", "");
    animateCounter("dachboardvalueexits", 0, valueexits, "", "");
    animateCounter("dachboardprocentexits", 0, procentexits, "", "");
    



    let symbol = "+";
    if (countstatus === 0) {
        symbol = "";
    }

    //animateCounter("dachboardcountstatus", 0, countstatus, "", ` ${symbol}`);
    //animateCounter("dachboardvaluestatus", 0, valuestatus, "", "");
    //animateCounter("dachboardprocentstatus", 0, procentstatus, "", "");
    
}

document.getElementById('generatpubliclinkbutton').onclick = function() {
    genetatepublicLink();
};


document.getElementById("dashboardgroupselector").addEventListener("change", () => {

    const selector = document.getElementById("dashboardgroupselector");
    const selectedText = selector.options[selector.selectedIndex].text;
    document.getElementById("groupnameheader").textContent = selectedText;
     //resete søkefelt
     document.getElementById("searchcustomer").value = "";

    loadDashboardporte(calculatingPorteDashboard(klientdata));
    loadDashboardsale(calculatingSaleDashboard(klientdata));
    
    //hvis disse siden er åpen
   const activeTab = getActiveTab();
   if (activeTab === "Likviditet") {
    loadLiquidityOverview(calculateMonthlyValues(klientdata));
    } else if (activeTab === "kundeliste") {
    listCustomer(klientdata);
    }
    
});

document.getElementById("customerGroupselector").addEventListener("change", () => {
    listCustomer(klientdata);
});

document.getElementById("dashboarddateselector").addEventListener("change", () => {
    loadDashboardsale(calculatingSaleDashboard(klientdata)); 
});

function loaddSelectors(groups){
    const selector = document.getElementById("dashboardgroupselector");
    const listSelector = document.getElementById("customerGroupselector");

    loadGroupSelector(groups,selector);
    loadGroupSelector(groups,listSelector);


}

function loadGroupSelector(groups,selector) {

    // Tømmer eksisterende alternativer
    selector.innerHTML = "";

    // Sorter gruppene alfabetisk etter groupname
    const sortedGroups = groups.sort((a, b) =>
        a.groupname.localeCompare(b.groupname, 'no', { sensitivity: 'base' })
    );

    // Legg til "Alle"-alternativet øverst
    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "Alle";
    selector.appendChild(allOption);

    // Legg til de sorterte gruppene
    sortedGroups.forEach(group => {
        const option = document.createElement("option");
        option.value = group.group;
        option.textContent = group.groupname;
        selector.appendChild(option);
    });
}

function loadSelectorDates(){

    const selector = document.getElementById("dashboarddateselector");
    loadDateSelector(selector);

    const listSelector = document.getElementById("listdateselector");
    loadDateSelector(listSelector);

}

function loadDateSelector(selector) {
    
    // Tømmer eksisterende alternativer
    selector.innerHTML = "";

    // Finner dagens dato
    const today = new Date();
    const currentYear = today.getFullYear();

    // Hjelpefunksjoner
    const formatDate = date => date.toISOString().split("T")[0]; // Formater dato som YYYY-MM-DD

    const getDateRange = (months, unit = "months", days = 0) => {
        const startDate = new Date(today);
        if (unit === "months") {
            startDate.setMonth(startDate.getMonth() - months);
        } else if (unit === "days") {
            startDate.setDate(startDate.getDate() - days);
        }
        return `${formatDate(startDate)},${formatDate(today)}`;
    };

    // Beregner datointervallene
    const options = [
        { text: "Siste 12 mnd.", value: getDateRange(12) },
        { text: "Siste 6 mnd.", value: getDateRange(6) },
        { text: "Siste 3 mnd.", value: getDateRange(3) },
        { text: "Siste 30 dager", value: getDateRange(1, "days", 30) },
        { text: "Hittil i år", value: `${currentYear}-01-01,${formatDate(today)}` },
        { text: `Året ${currentYear - 1}`, value: `${currentYear - 1}-01-01,${currentYear - 1}-12-31` }
    ];

    // Legger til alternativer i selector
    options.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option.value;
        opt.textContent = option.text;
        selector.appendChild(opt);
    });
}

// Hjelpefunksjon for å beregne datointervaller
function getDateRange(months, unit = "months", daysBack = null) {
    const today = new Date();
    const endDate = formatDate(today);

    // Beregn startdato basert på enhet (måneder eller dager)
    let startDate;
    if (unit === "months") {
        const start = new Date();
        start.setMonth(start.getMonth() - months);
        startDate = formatDate(start);
    } else if (unit === "days") {
        const start = new Date();
        start.setDate(start.getDate() - daysBack);
        startDate = formatDate(start);
    }

    return `${startDate},${endDate}`;
}

// Hjelpefunksjon for å formatere datoer til "YYYY-MM-DD"
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function ruteresponse(data,id){
    if(id == "klientresponse"){
        klientresponse(data);
    }else if(id == "respondcustomerlistupdated"){
        respondcustomerlistupdated(data);
    }else if(id == "companyDeletedResponse"){
        companyDeletedResponse(data);
    }else if(id == "updateklientresponse"){
        updateklientresponse(data);
    }else if(id == "responPostpublicLink"){
        responPostpublicLink(data);
    }
    

}

function getActiveTab() {
    // Finn elementet med klassen 'w--current'
    const activeTab = document.querySelector('.tabs-menu-2 .w--current');

    // Returner dataen eller tekstinnholdet til den aktive fanen
    if (activeTab) {
        return activeTab.getAttribute('data-w-tab') || activeTab.textContent.trim();
    }

    return null; // Ingen aktiv fane funnet
}







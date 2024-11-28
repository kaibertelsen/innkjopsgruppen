
var klientdata = [];

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
    loadGroupSelector(getUniqueGroups(objects));
    loadDateSelector();

    loadDashboard(calculatingPorteDashboard(objects));
    // Gjør noe med objektene om nødvendig
    // Eksempel: objects.forEach(obj => console.log(obj.Name));
}


function calculatingPorteDashboard(objects, monthsBack = 12) {
    const now = new Date(); // Nåværende dato
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack); // Juster cutoff-dato basert på monthsBack

    let sumkickback = 0; // For å summere kickbackvalue innenfor tidsrammen
    let sumvaluegroup = 0; // For å summere valuegroup-verdier

    // Hent valgt gruppe fra select-elementet
    const selectedGroup = document.getElementById("dashboardgroupselector").value;

    objects.forEach(obj => {
        // Sjekk om objektet tilhører valgt gruppe, eller inkluder alt hvis "Alle" er valgt
        if (selectedGroup === "" || obj.group === selectedGroup) {
            // Summér valuegroup hvis det finnes og er et tall
            if (obj.valuegroup) {
                const valuegroupNumber = parseFloat(obj.valuegroup); // Konverter til tall
                if (!isNaN(valuegroupNumber)) {
                    sumvaluegroup += valuegroupNumber;
                }
            }

            // Håndter cashflowjson
            if (obj.cashflowjson && Array.isArray(obj.cashflowjson)) {
                obj.cashflowjson.forEach(cashflow => {
                    if (cashflow.maindate) {
                        const maindate = new Date(cashflow.maindate);

                        // Sjekk om maindate er innenfor tidsrammen
                        if (maindate >= cutoffDate && maindate <= now) {
                            // Summér kickbackvalue hvis det er et tall
                            if (cashflow.kickbackvalue) {
                                const kickbackNumber = parseFloat(cashflow.kickbackvalue); // Konverter til tall
                                if (!isNaN(kickbackNumber)) {
                                    sumkickback += kickbackNumber;
                                }
                            }
                        }
                    }
                });
            }
        }
    });

    // Returner resultatene
    return {
        sumvaluegroup,
        sumkickback
    };
}


function formatToCurrency(value) {
    if (isNaN(value)) {
        throw new Error("Verdien må være et tall");
    }
    const roundedValue = Math.round(value); // Avrunder til nærmeste heltall
    const formattedValue = roundedValue.toLocaleString('no-NO'); // Legger til tusenskiller i norsk format
    return `${formattedValue} kr`; // Legger til 'kr'
}

function loadDashboard(data){
    let sumkickback = data.sumkickback;
    let sumvaluegroup = data.sumvaluegroup;
    let sumtotal = sumkickback+sumvaluegroup;
    document.getElementById("dachboardportsumtotal").textContent = formatToCurrency(sumtotal);
    document.getElementById("dachboardportkickback").textContent = formatToCurrency(sumkickback);
    document.getElementById("dachboardportvaluegroup").textContent = formatToCurrency(sumvaluegroup);
}
document.getElementById("dashboardgroupselector").addEventListener("change", () => {
    loadDashboard(calculatingPorteDashboard(klientdata)); 
});


function loadGroupSelector(groups) {
    const selector = document.getElementById("dashboardgroupselector");

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


function loadDateSelector() {
    const selector = document.getElementById("dashboarddateselector");

    // Tømmer eksisterende alternativer
    selector.innerHTML = "";

    // Finner dagens dato
    const today = new Date();
    const currentYear = today.getFullYear();

    // Beregner datointervallene
    const options = [
        { text: "Siste 12 mnd.", value: getDateRange(12) },
        { text: "Siste 6 mnd.", value: getDateRange(6) },
        { text: "Siste 3 mnd.", value: getDateRange(3) },
        { text: "Siste 30 dager", value: getDateRange(1, "days", 30) },
        { text: "Hittil i år", value: `${currentYear}-01-01,${formatDate(today)}` },
        { text: "Fjordåret", value: `${currentYear - 1}-01-01,${currentYear - 1}-12-31` }
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
    }
    
}
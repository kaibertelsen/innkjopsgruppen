var historylog;




function startvaluelist(data, load, sortname, descending) {
    listarray = [];
    // Sjekk verdien i tekstfeltet
    let searchField = document.getElementById("dropdownval");
    let searchValue = searchField ? searchField.value.toLowerCase() : ""; // Søkestreng fra tekstfeltet
  
    // Filtrer data basert på søkestrengen
    if (searchValue) {
        data = data.filter(company => 
            company.Name.toLowerCase().includes(searchValue)
        );
    }

    // Filtrer data basert på valgt gruppe i customergroupselector
    const groupSelector = document.getElementById("customergroupselector");
    const selectedGroup = groupSelector ? groupSelector.value : ""; // Hent valgt verdi (airtable-ID)

    if (selectedGroup === "none") {
        // Hvis "none" er valgt, vis kun selskaper med tom group
        data = data.filter(company => !company.group || company.group === "");
    } else if (selectedGroup) {
        // Hvis en gruppe er valgt (ikke tom eller "none"), vis kun selskaper i den gruppen
        data = data.filter(company => company.group === selectedGroup);
    }
    // Hvis selectedGroup er tom, filtreres ingenting vekk

    // Sjekk datofeltene
    const startDateField = document.getElementById("startDate");
    const endDateField = document.getElementById("endDate");
  
    const startDate = startDateField && startDateField.value ? new Date(startDateField.value) : null;
    const endDate = endDateField && endDateField.value ? new Date(endDateField.value) : null;
  
    // Sorter data alfabetisk basert på "customer"-nøkkelen
    data.sort((a, b) => {
        if (a.customer < b.customer) return descending ? 1 : -1;
        if (a.customer > b.customer) return descending ? -1 : 1;
        return 0;
    });
  
    const list = document.getElementById("valuelist");
    list.replaceChildren();
  
    const elementLibrary = document.getElementById("libraryelements");
    const nodeElement = elementLibrary.querySelector('.customerrow');
  
    document.getElementById("valucustomcounter").textContent = `${data.length} stk. Kunder`;
  
    // Opprett en formatter for NOK valuta
    const formatter = new Intl.NumberFormat('no-NO', {
        style: 'currency',
        currency: 'NOK',
        minimumFractionDigits: 0, // Ingen desimaler
        maximumFractionDigits: 0,
    });
  
    let sum = {value:0,cut:0,kickback:0};

    listarray = data;

    data.forEach((company, index) => {
        const companyElement = nodeElement.cloneNode(true);
  
        // Legg til klassen "second" på annenhver element
        if (index % 2 !== 0) {
            companyElement.classList.add("second");
        }
  
        list.appendChild(companyElement);
  
        const name = companyElement.querySelector(".customname");
        name.textContent = company.Name;
        name.addEventListener("click", () => {
            historylog = "customerList";
            handleCompanyClick(company.Name, company.airtable);
        });

  
        let totals = { value: 0, cut: 0, kickback: 0,bistand:0,analyse:0};
        // Sjekk at cashflowjson eksisterer og er en array
        if (Array.isArray(company.cashflowjson)) {
            // Summer value, cut og kickbackvalue innenfor datoene
            totals = company.cashflowjson.reduce((acc, item) => {
                const mainDate = new Date(item.maindate);
  
                // Sjekk om maindate er innenfor startDate og endDate
                if (
                    (!startDate || mainDate >= startDate) &&
                    (!endDate || mainDate <= endDate)
                ) {
                    acc.value += parseFloat(item.value || 0);
                    acc.cut += parseFloat(item.cut || 0);
                    acc.kickback += parseFloat(item.kickbackvalue || 0);
                    acc.bistand += parseFloat(item.bistand || 0);
                    acc.analyse += parseFloat(item.analyse || 0);
                
                    sum.value += parseFloat(item.value || 0);
                    sum.cut += parseFloat(item.cut || 0);
                    sum.kickback += parseFloat(item.kickbackvalue || 0);
                    sum.analyse += parseFloat(item.analyse || 0);
                    sum.bistand += parseFloat(item.bistand || 0);
                }
                return acc;
            }, totals);
        } else {
            console.error("cashflowjson is not a valid array.");
        }
  
        const value = companyElement.querySelector(".customvalue");
        value.textContent = formatter.format(totals.value);
  
        const cut = companyElement.querySelector(".customcut");
        cut.textContent = formatter.format(totals.cut);
  
        const kickback = companyElement.querySelector(".cutsomkickback");
        kickback.textContent = formatter.format(totals.kickback);

        //legge til for bruk ved exsport
        company.value = totals.value;
        company.kickbackvalue = totals.kickback;
        company.cut = totals.cut;
        company.bistand = totals.bistand;
        company.analyse = totals.analyse
       
    });

    //oppdatere sum
    const ValueElement = document.getElementById("sumValue");
    ValueElement.textContent = formatter.format(sum.value);

    const CutElement = document.getElementById("sumCut");
    CutElement.textContent = formatter.format(sum.cut);

    const KickbackElement = document.getElementById("sumKickback");
    KickbackElement.textContent = formatter.format(sum.kickback);
}
  
// Legg til søkefunksjon
document.getElementById("dropdownval").addEventListener("input", () => {
    startvaluelist(companyListbuffer, true); // Sender det filtrerte datasettet til funksjonen
});

document.getElementById("startDate").addEventListener("input", () => {
    startvaluelist(companyListbuffer, true); // Sender det filtrerte datasettet til funksjonen
});

document.getElementById("endDate").addEventListener("input", () => {
    startvaluelist(companyListbuffer, true); // Sender det filtrerte datasettet til funksjonen
});

document.getElementById("customergroupselector").addEventListener("change", function() {
    startvaluelist(companyListbuffer, true); // Sender det filtrerte datasettet til funksjonen
});

document.getElementById('backbuttonCustomer').onclick = function() {
    //sjekke historikken
    if(historylog == "customerList"){
        document.getElementById("startcustomerbutton").click();
    }else if (historylog == "followupList"){
        document.getElementById("followupbutton").click();
    }
};





function updateOpenlistPage(pages){

    if(pages){
    
    }else{
        
        if (document.getElementById('besparelsebutton').classList.contains('w--current')){
        pages = "besparelsebutton";
        }else if(document.getElementById('startsupplierbutton').classList.contains('w--current')){
        pages = "startsupplierbutton";
        }else if(document.getElementById('startcustomerbutton').classList.contains('w--current')){
        pages =  "startcustomerbutton";
        }
    }
    
    if(pages == "besparelsebutton"){
        if(companydatalines.length>0){
       mainrootcompanylist(companydatalines);
        }
    }else if (pages == "startsupplierbutton") {
      if(supplierlistbuffer.length>0){
        
          let deepCopyArray = JSON.parse(JSON.stringify(cashflowdatoarray));
         //hvis supplierarray in loaded
         var mergedarray = mergerowInArray("supplier",["value","cutvalue","kickbackvalue"],deepCopyArray);
         //slå sammen cash end supplier
         var combinearray = combineArrays("name","supplier",["value","cutvalue","kickbackvalue"],supplierlistbuffer,mergedarray);
         startlist(combinearray,true,"kickbackvalue",false);
        }
    }

    if(buffercompanydata.length>0){
            // Filtrer ut kunder som har cashflow
            companyListbuffer = buffercompanydata.filter(company => company.cashflowjson.length > 0);
            startvaluelist(companyListbuffer, true, "", "");
            loadCustomerGroup(companyListbuffer);   
    }

}

function loadCustomerGroup(data) {
    var dropdownMenu = document.getElementById("customergroupselector");
    dropdownMenu.innerHTML = ''; // Tømmer eksisterende options

    // Opprett et Map for å holde styr på unike grupper
    const uniqueGroups = new Map();

    // Fyll settet med unike groupname og airtable kombinasjoner
    data.forEach(item => {
        const groupName = item.groupname || "Ingen Grupper"; // Standard tekst for tomme grupper
        const airtableId = item.group || "none"; // Standard ID for tomme grupper

        if (!uniqueGroups.has(airtableId)) {
            uniqueGroups.set(airtableId, { name: groupName, airtable: airtableId });
        }
    });

    // Konverter settet til en array
    const uniqueGroupArray = Array.from(uniqueGroups.values());

    // Sorter arrayen alfabetisk basert på gruppenavn
    uniqueGroupArray.sort((a, b) => a.name.localeCompare(b.name));

    // Legg til "Velg gruppe"-option
    const defaultOption = document.createElement("option");
    defaultOption.value = ""; // Tom verdi
    defaultOption.textContent = "Velg gruppe"; // Tekst som vises
    dropdownMenu.appendChild(defaultOption);

    // Lag options basert på unike grupper
    uniqueGroupArray.forEach(group => {
        var option = document.createElement("option");
        option.value = group.airtable; // Airtable-ID som verdi
        option.textContent = group.name; // Gruppens navn som tekst
        dropdownMenu.appendChild(option);
    });

    // Logg arrayen for debugging
    console.log(uniqueGroupArray);
}




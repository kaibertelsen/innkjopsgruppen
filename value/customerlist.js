function startvaluelist(data, load, sortname, descending) {
    // Sjekk verdien i tekstfeltet
    let searchField = document.getElementById("dropdownval");
    let searchValue = searchField ? searchField.value.toLowerCase() : ""; // Søkestreng fra tekstfeltet
  
    // Filtrer data basert på søkestrengen
    if (searchValue) {
        data = data.filter(company => 
            company.Name.toLowerCase().includes(searchValue)
        );
    }
  
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
  
    document.getElementById("valucustomcounter").textContent = `${data.length} stk.`;
  
    // Opprett en formatter for NOK valuta
    const formatter = new Intl.NumberFormat('no-NO', {
        style: 'currency',
        currency: 'NOK',
        minimumFractionDigits: 0, // Ingen desimaler
        maximumFractionDigits: 0,
    });
  
    data.forEach((company, index) => {
        const companyElement = nodeElement.cloneNode(true);
  
        // Legg til klassen "second" på annenhver element
        if (index % 2 !== 0) {
            companyElement.classList.add("second");
        }
  
        list.appendChild(companyElement);
  
        const name = companyElement.querySelector(".customname");
        name.textContent = company.Name;
  
        let totals = { value: 0, cut: 0, kickback: 0 };
  
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
    });
  }
  

// Legg til søkefunksjon
const searchField = document.getElementById("dropdownval");
document.getElementById("dropdownval").addEventListener("input", () => {
    startvaluelist(companyListbuffer, true); // Sender det filtrerte datasettet til funksjonen
});


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
    }else if(pages == "startcustomerbutton"){
         if(buffercompanydata.length>0){
            // Filtrer ut kunder som har cashflow
            companyListbuffer = buffercompanydata.filter(company => company.cashflowjson.length > 0);
            startvaluelist(companyListbuffer, true, "", "");
        }
    }
}


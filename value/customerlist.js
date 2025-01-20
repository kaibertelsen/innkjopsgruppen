function startvaluelist(data, load, sortname, descending) {
    if(load){
        listarray = data;
    }else{
    }
    

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
        name.textContent = company.customer;

        const value = companyElement.querySelector(".customvalue");
        value.textContent = formatter.format(company.value);

        const cut = companyElement.querySelector(".customcut");
        cut.textContent = formatter.format(company.cutvalue);

        const kickback = companyElement.querySelector(".cutsomkickback");
        kickback.textContent = formatter.format(company.kickbackvalue);
    });
}

// Legg til søkefunksjon
const searchField = document.getElementById("dropdownval");
document.getElementById("dropdownval").addEventListener("input", () => {
    startvaluelist(filteredData, true); // Sender det filtrerte datasettet til funksjonen
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
         if(klientdata.length>0){
        // list alle kunder som har cachflow


        }
    }
}


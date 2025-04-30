var userid;
var gGroups = [];
var gCustomers = [];

function getCustomer(){     
    //hente kunder
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC","rec1QGUGBMVaqxhp1","customerResponse","skipCache");
}

function getGroup(){     
    //hente kunder
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC","receQgUaqXVlQ20Ag","groupResponse","skipCache");
}

function groupResponse(data){
    if (!data || !data.fields || !data.fields.groupjson || !Array.isArray(data.fields.groupjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields.groupjson' som en array.");
        return; // Avbryt hvis data ikke er gyldig
    }
    //sjekke om data.feilds.superAdmin array inneholder min brukeri
    const groups = data.fields.groupjson;
    gGroups = convertGroupJsonStringsToObjects(groups);

    //last inn gruppene i selector
    const selector = document.getElementById("groupSelector");
    loadeGroupSelector(gGroups,selector);

}

function loadeGroupSelector(groups,selector){
   
    //sortere gruppene alfabetisk
    groups.sort((a, b) => {
        const nameA = a.Name?.trim().toLowerCase() || "";
        const nameB = b.Name?.trim().toLowerCase() || "";
        return nameA.localeCompare(nameB, 'no', { sensitivity: 'base' });
    });

    //sjekke om selector er null
    if(selector == null){
        selector = document.getElementById("groupSelector");
    }
    //tømme selector
    selector.innerHTML = ""; // Tøm tidligere innhold
    // Legg til en tom verdi først
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Velg gruppe";
    selector.appendChild(emptyOption);
    // Legg til alternativene
    groups.forEach(group => {
        const option = document.createElement("option");
        option.value = group.Name;
        option.textContent = group.Name;
        selector.appendChild(option);
    }
    );
    
}

function convertGroupJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
        try {
            
            // Parse JSON-strengen uten HTML-dataen
            const data = JSON.parse(jsonString);

            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}
    
function customerResponse(data){
    
    if (!data || !data.fields || !data.fields.membersjson || !Array.isArray(data.fields.membersjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields.supplierjson' som en array.");
        return; // Avbryt hvis data ikke er gyldig
    }

    //sjekke om data.feilds.superAdmin array inneholder min brukerid
    if(data.fields.superAdmin){
        if(data.fields.superAdmin.includes(userid)){
            
        }else{  
            return;
        }
    }
    
    // Konverter JSON-strenger til objekter
    const jsonStrings = data.fields.membersjson;
    
    let customers = convertCustomerJsonStringsToObjects(jsonStrings);
    gCustomers = customers;
    
    //hente grupper
    getGroup();
    
}



document.getElementById("openXlsButton").addEventListener("click", function(event) {
    event.preventDefault(); 
    const widget = uploadcare.Widget("#logoUploadcareWidget");
    widget.openDialog().done(function(file) {
        file.done(function(info) {
            const fileURL = info.cdnUrl;
            console.log("Opplastet fil:", fileURL);
            importXlsFile(fileURL);
        });
    });
});

async function importXlsFile(urlToXlsFile) {
    const response = await fetch(urlToXlsFile);
    if (!response.ok) {
        throw new Error("Kunne ikke laste ned filen");
    }
    const arrayBuffer = await response.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const firstSheet = workbook.worksheets[0];

    if (!firstSheet) {
        console.warn("Ingen ark funnet i Excel-filen.");
        return;
    }

    const sheetName = firstSheet.name;
    const sheetData = [];
    const headers = [];

    firstSheet.eachRow((row, rowIndex) => {
        if (rowIndex === 1) {
            row.eachCell((cell, colIndex) => {
                headers[colIndex] = cell.text.trim();
            });
        } else {
            const rowData = {};
            row.eachCell((cell, colIndex) => {
                const header = headers[colIndex];
                if (header) {
                    rowData[header] = cell.text.trim();
                }
            });
            sheetData.push(rowData);
        }
    });

    //const result = { [sheetName]: sheetData };
    controllXls(sheetData);
}

function controllXls(data) {
    const eksisterende = [];
    const nye = [];

    //sorter data alfabetisk på navn
    data.sort((a, b) => {
        const nameA = a["Selskap"]?.trim().toLowerCase() || "";
        const nameB = b["Selskap"]?.trim().toLowerCase() || "";
        return nameA.localeCompare(nameB, 'no', { sensitivity: 'base' });
    });

    data.forEach(item => {
        const navn = item["Selskap"]?.trim().toLowerCase();
        const orgnr = item["Org.nr"]?.trim();

        const match = gCustomers.find(customer =>
            customer.Name?.trim().toLowerCase() === navn &&
            customer.orgnr?.trim() === orgnr
        );

        if (match) {
            eksisterende.push(item);
        } else {
            nye.push(item);
        }
    });

    

    if (eksisterende.length > 0) {
        alert("Noen av selskapene finnes allerede i portalen basert på navn og organisasjonsnummer.");
    }

    // Bruk eksisterende container uten å style den
    const container = document.getElementById("resultlist");
    container.innerHTML = ""; // Tøm tidligere innhold
    container.style.display = "inline-block"; // Vis containeren

    // Lag og legg til knapp hvis det finnes nye selskaper
    if (nye.length > 0) {
        const importButton = document.createElement("button");
        importButton.textContent = "Importer de nye selskapene";

        // Kun knappen styles
        importButton.style.marginBottom = "10px";
        importButton.style.padding = "8px 16px";
        importButton.style.backgroundColor = "#1b5e20";
        importButton.style.color = "#fff";
        importButton.style.border = "none";
        importButton.style.borderRadius = "6px";
        importButton.style.cursor = "pointer";

        importButton.addEventListener("click", () => {
            importCustomerList(nye);
        });

        container.appendChild(importButton);
    }

    const eksisterendeHTML = generateStyledList("Eksisterende selskaper (allerede registrert)", eksisterende, "red");
    const nyeHTML = generateStyledList("Nye selskaper (klare for import)", nye, "darkgreen");

    container.insertAdjacentHTML("beforeend", eksisterendeHTML + nyeHTML);
}

function importCustomerList(nye){
console.log("Importerer nye selskaper:", nye);
}

function generateTable(title, list) {
    if (list.length === 0) return `<h3>${title}</h3><p>Ingen.</p>`;

    let html = `<h3>${title}</h3><table style="width:100%; border-collapse: collapse;">`;
    html += `<tr><th style="text-align:left; border-bottom: 1px solid #ccc;">Selskap</th><th style="text-align:left; border-bottom: 1px solid #ccc;">Org.nr</th></tr>`;

    list.forEach(item => {
        html += `<tr><td style="padding: 4px 8px;">${item["Selskap"]}</td><td style="padding: 4px 8px;">${item["Org.nr"]}</td></tr>`;
    });

    html += `</table>`;
    return html;
}

function generateStyledList(title, list, color) {
    if (list.length === 0) return `<h3>${title}</h3><p style="color:${color};">Ingen</p>`;

    let html = `<h3>${title}</h3><ul style="list-style: none; padding-left: 0;">`;

    list.forEach(item => {
        html += `<li style="color: ${color}; padding: 4px 0;">${item["Selskap"]} (${item["Org.nr"]})</li>`;
    });

    html += `</ul>`;
    return html;
}

function ruteresponse(data,id){

    if(id == "customerResponse"){
        customerResponse(data);
    }else if(id == "groupResponse"){
        groupResponse(data);
    }

}

function convertCustomerJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
        try {
            
            // Parse JSON-strengen uten HTML-dataen
            const data = JSON.parse(jsonString);


            // Sørg for at "group" og "category" alltid er arrays
            if (!data.cashflowjson) {
                data.cashflowjson = [];
            }

            if (!data.bruker) {
                data.bruker = [];
            }

            if (!data.invitasjon) {
                data.invitasjon = [];
            }

            if (!data.connection) {
                data.connection = [];
            }

            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}
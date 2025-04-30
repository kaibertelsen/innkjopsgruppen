var userid;

function getCustomer(){     
    //hente kunder
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC","rec1QGUGBMVaqxhp1","customerResponse","skipCache");
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

    // Lag wrapper container
    const container = document.createElement("div");
    container.style.maxHeight = "400px";
    container.style.overflowY = "auto";
    container.style.border = "1px solid #ccc";
    container.style.padding = "10px";
    container.style.marginTop = "20px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.background = "#f9f9f9";

    const eksisterendeHTML = generateTable("Eksisterende selskaper", eksisterende);
    const nyeHTML = generateTable("Nye selskaper", nye);

    container.innerHTML = eksisterendeHTML + nyeHTML;

    // Fjern gammel visning om den finnes
    const old = document.getElementById("xlsResultContainer");
    if (old) old.remove();

    container.id = "xlsResultContainer";
    document.body.appendChild(container); // eller document.querySelector("#outputDiv")
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



function ruteresponse(data,id){

    if(id == "customerResponse"){
        customerResponse(data);
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
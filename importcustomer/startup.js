var userid;
var gGroups = [];
var gCustomers = [];
var readyComsomerlist = [];
var gInventations = [];
var mailSending = {};

function getCustomer(){     
    //hente kunder
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC","rec1QGUGBMVaqxhp1","customerResponse","skipCache");
}

function getGroup(){     
    //hente kunder
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC","receQgUaqXVlQ20Ag","groupResponse","skipCache");
}
const selector = document.getElementById("groupSelector");
selector.style.display = "none"; // Skjul selector ved start

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
    selector.style.display = "block"; // Vis selector

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
        option.value = group.airtable;
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

    // Sorter data alfabetisk på navn
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

    const container = document.getElementById("resultlist");
    container.innerHTML = "";
    container.style.display = "inline-block";

    if (nye.length > 0) {
        const importButton = document.createElement("button");
        importButton.textContent = "Importer de nye selskapene";

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

    const eksisterendeHTML = generateStyledList(`Eksisterende selskaper (${eksisterende.length})`, eksisterende, "red");
    const nyeHTML = generateStyledList(`Nye selskaper (${nye.length})`, nye, "darkgreen");

    container.insertAdjacentHTML("beforeend", eksisterendeHTML + nyeHTML);
}


function importCustomerList(nye) {
    console.log("Importerer nye selskaper:", nye);
    const statusProgressLabling = document.getElementById("statusProgressLabling");
    statusProgressLabling.innerText = "Oppretter selskaper i database!";

    //lagere de nye i global liste for seinere å koble til kontaktpersoner
    readyComsomerlist = nye;

    const selector = document.getElementById("groupSelector");
    const selectedGroup = selector.value;

    if (selectedGroup === "") {
        alert("Vennligst velg en gruppe før du importerer.");
        return;
    }

    const savedata = nye.map(item => {
        const fullAdresse = item["Adresse"]?.trim() || "";
        let adresse = "";
        let postnr = "";
        let poststed = "";

        if (fullAdresse.includes(",")) {
            const [del1, del2] = fullAdresse.split(",").map(s => s.trim());
            adresse = del1;

            const match = del2.match(/^(\d{4})\s*(.*)$/); // matcher "1234 Oslo"
            if (match) {
                postnr = match[1];
                poststed = match[2];
            } else {
                poststed = del2;
            }
        } else {
            adresse = fullAdresse;
        }

        return {
            Name: item["Selskap"]?.trim() || "",
            orgnr: item["Org.nr"]?.trim() || "",
            adresse,
            postnr,
            poststed,
            gruppe: [selectedGroup],
            klient:["rec1QGUGBMVaqxhp1"]
        };
    });

    console.log("Formatert data (klare for import):", savedata);

    // sendToAirtable(savedata); // eller annen lagring
    multisave(savedata, "app1WzN1IxEnVu3m0", "tblFySDb9qVeVVY5c", "retunrMultiImportCustomer");
}

function retunrMultiImportCustomer(data) {
    console.log("retunrMultiImportCustomer:", data);

    const allRecords = [];

    data.forEach(batch => {
        if (Array.isArray(batch)) {
            batch.forEach(record => {
                const fields = record.fields || {};
                allRecords.push({
                    airtable: record.id,
                    Name: fields.Name || "",
                    orgnr: fields.orgnr || ""
                });
            });
        }
    });

    console.log("Importer resultat (kun relevante nøkler):", allRecords);

    const invitations = [];
    readyComsomerlist.forEach(item => {
        const navn = item["Selskap"]?.trim().toLowerCase();
        const orgnr = item["Org.nr"]?.trim();

        const match = allRecords.find(customer =>
            customer.Name?.trim().toLowerCase() === navn &&
            customer.orgnr?.trim() === orgnr
        );

        if (match) {
            invitations.push({
                navn: item["Kontaktperson"],
                telefon: item["Telefon"],
                epost: item["E-post"],
                avsender: [userid],
                rolle: "Admin",
                firma: [match.airtable]
            });
        }
    });

    console.log("Invitations som skal importeres:", invitations);

    const statusProgressLabling = document.getElementById("statusProgressLabling");
    statusProgressLabling.innerText = "Oppretter invitasjoner i database!";
    multisave(invitations, "app1WzN1IxEnVu3m0", "tblc1AGhwc6MMu4Aw", "retunrMultiImportInvitations");
}

function retunrMultiImportInvitations(data) {
    console.log("retunrMultiImportInvitations:", data);

    const allRecords = [];

    data.forEach(batch => {
        if (Array.isArray(batch)) {
            batch.forEach(record => {
                const fields = record.fields || {};
                allRecords.push({
                    airtable: record.id,
                    navn: fields.navn || "",
                    epost: fields.epost || "",
                    orgnr: fields.orgnr || "",
                    firmanavn: fields.firmanavn || "",
                });
            });
        }
    });

    console.log("Importer resultat (kun relevante nøkler):", allRecords);

    gInventations = allRecords;
    //opprette public invitation link
    loopGenerateDataForPublickLink();


}

function loopGenerateDataForPublickLink() {

    //oppdatere status
    const statusProgressLabling = document.getElementById("statusProgressLabling");
    //finne hvor mange invitasjoner som er igjen
    const remainingInvitations = gInventations.length;
    const totalInvitations = gInventations.length + mailSending.length;
    const percent = Math.round(((totalInvitations - remainingInvitations) / totalInvitations) * 100);
    statusProgressLabling.innerHTML = `<strong>${percent}</strong><span>&nbsp;%</span>`;
    
    //sjekke om det er flere invitasjoner igjen
    if(gInventations.length == 0){
        //Ferdig å sende mail
        statusProgressLabling.innerText = "Ferdig med å opprette invitasjoner og sende mail!";
    }else{
        //hente første element i gInventations
        const allRecords = gInventations;
        mailSending = allRecords[0];
        generateDataForPublickLink(mailSending);
    }

}



//public invitasjon system
function generateDataForPublickLink(data) {

    // Generer en sharelink
    let baseId = "app1WzN1IxEnVu3m0";
    let tableId = "tblc1AGhwc6MMu4Aw";
    let rowId = data.airtable;
    let text = "Invitasjonslink";

    // Beregn utløpsdatoen 3 måneder frem i tid
    let expirationdate = new Date();
    expirationdate.setMonth(expirationdate.getMonth() + 3);

    // Formatér datoen til "YYYY-MM-DD"
    let expirationdateFormatted = expirationdate.toISOString().split('T')[0];

    // Generer offentlig lenke
    generatePublicLink({ baseId, tableId, rowId, text, expirationdate: expirationdateFormatted },"responPostpublicLink");
}

function generatePublicLink(data,response) {
    // Sjekk om nødvendig data finnes
    if (!data.baseId || !data.tableId || !data.rowId || !data.text || !data.expirationdate) {
        console.error("Manglende data for å generere offentlig link.");
        return;
    }

    // Generer body for POST-forespørselen
    let body = {
        query: `baseId=${data.baseId}&tableId=${data.tableId}&rowId=${data.rowId}`,
        note: data.text,
        expirationDate: data.expirationdate
    };

    // Send POST-forespørsel
    POSTairtablepublicLink(JSON.stringify(body), response);
}


function responPostpublicLink(data){
 
    // Sett href-attributtet til ønsket URL
    let link = "https://portal.innkjops-gruppen.no/app-portal?"+"shareKey="+data.shareKey+"&shareId="+data.shareId;
    console.log(link);
    //finne objectet i gInventations
    mailSending.link = link;

    console.log(mailSending);

    // Send mail via Zapier
    sendUserToZapier(mailSending)

    //finne objectet med data i gInventations og slette det
    const index = gInventations.findIndex(item => item.airtable === mailSending.airtable);
    if (index !== -1) {
        gInventations[index].link = link;
    }
    gInventations.splice(index, 1);


    loopGenerateDataForPublickLink()
}

async function sendUserToZapier(data) {
    
    const formData = new FormData();
    for (const key in data) {
        const value = data[key];
        // Sjekk om verdien er en array eller objekt og stringify hvis nødvendig
        formData.append(key, Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : value);
    }

    const response = await fetch("https://hooks.zapier.com/hooks/catch/10455257/2pxqwnk/", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
      
    } else {
        console.error("Error sending data to Zapier:", response.statusText);
    }
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
    let html = `<h3>${title}</h3>`;

    // Antall linje – alltid vises
    html += `<p style="color:${color}; font-size: 0.9em; font-style: italic; margin-top: -10px; margin-bottom: 10px;">Antall: ${list.length}</p>`;

    if (list.length === 0) {
        html += `<p style="color:${color};">Ingen</p>`;
        return html;
    }

    html += `<ul style="list-style: none; padding-left: 0;">`;

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
    }else if(id == "retunrMultiImportCustomer"){
        retunrMultiImportCustomer(data);
    }else if(id == "retunrMultiImportInvitations"){
        retunrMultiImportInvitations(data);
    }else if(id == "responPostpublicLink"){
        responPostpublicLink(data);
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


async function multisave(data, baseid, tabelid, returid) {
    const batchSize = 10;
    const totalBatches = Math.ceil(data.length / batchSize); // hvor mange runder vi skal kjøre
    const statusEl = document.getElementById("statusProgressUploading");
  
    let sendpacks = 0;
    const allResponses = [];

    const sendBatch = async (batch, currentIndex) => {
        try {
            console.log("Sender batch:", batch);
            const response = await POSTairtableMulti(baseid, tabelid, batch);
            sendpacks++;

            const percent = Math.round(((currentIndex + 1) / totalBatches) * 100);
            if (statusEl) {
                statusEl.innerHTML = `<strong>${percent}</strong><span>&nbsp;%</span>`;

            }

            allResponses.push(response);
        } catch (error) {
            console.error("Feil ved sending av batch:", error);
            throw error;
        }
    };

    const processBatches = async () => {
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const batchIndex = Math.floor(i / batchSize);
            await sendBatch(batch, batchIndex);
        }

        if (statusEl) {
            statusEl.innerText = "100% - Ferdig!";
        }

        console.log("Alle batcher er ferdig prosessert.");
    };

    try {
        if (statusEl) {
            statusEl.innerText = "Starter opplasting...";
        }

        await processBatches();

        apireturn({ success: true, data: allResponses, id: returid });
    } catch (error) {
        console.error("Prosesseringen ble stoppet på grunn av en feil:", error);
        if (statusEl) {
            statusEl.innerText = "Feil under opplasting!";
        }
        apireturn({ success: false, error: error.message, id: returid });
    }
}

  
function convertMultiResponseData(data) {
    return data.flatMap(samling => samling.map(item => item.fields));
}

async function POSTairtableMulti(baseId, tableId, body) {
    return new Promise(async (resolve, reject) => {
        try {
            const token = await MemberStack.getToken();
            console.log("Token mottatt:", token);

            let requestBody = body.map(item => ({ fields: { ...item } }));

            console.log("Request Body som skal sendes:", requestBody);

            const response = await fetch(
                `https://expoapi-zeta.vercel.app/api/row?baseId=${baseId}&tableId=${tableId}&token=${token}`,
                {
                    method: "POST",
                    body: JSON.stringify(requestBody),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Feilrespons fra API: ${response.status} - ${response.statusText}`);
                console.error("Responsdata fra API:", errorText);
                reject(new Error(`HTTP-feil! status: ${response.status} - ${response.statusText}`));
            } else {
                const data = await response.json();
                console.log("Batch lagret med suksess:", data);
                resolve(data); // Returner responsdata for denne batchen
            }
        } catch (error) {
            console.error("Feil i POSTairtableMulti:", error);
            reject(error);
        }
    });
}



//importcustomer/startup.js
var userid;
var gGroups = [];
var gCustomers = [];
var readyComsomerlist = [];
var gInventations = [];
var mailSending = {};
var totalInvitations = 0;
var malonetext = "";
var sendCollection = "";
var gImportMode = "standard";
var gExistingMatchesToInvite = [];
var gPendingExistingInvitations = [];
var gPendingInvitationsToSend = [];

//Slå på ansattfordeler som standard
document.getElementById('benefitsSwitsh').checked = true;

//Sett standardvalg for import-modus
const importModeSelectorEl = document.getElementById("importModeSelector");
if (importModeSelectorEl) {
    importModeSelectorEl.value = "standard";
}

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
                    let value = "";
                
                    if (typeof cell.text === "string") {
                        value = cell.text.trim();
                    } else if (cell.text?.richText?.[0]?.text) {
                        value = cell.text.richText.map(rt => rt.text).join("").trim();
                    }
                
                    rowData[header] = value;
                }
                
            });
            sheetData.push(rowData);
        }
    });

    //const result = { [sheetName]: sheetData };
    controllXls(sheetData);
}

function controllXls(data) {
    const mode = document.getElementById("importModeSelector")?.value || "standard";
    gImportMode = mode;

    if (mode === "inviteExisting") {
        controllXlsInviteExisting(data);
        return;
    }

    const eksisterende = [];
    const nye = [];
    const feil = [];

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

    //sjekke epost kollonnen om den inneholder en gyldig epost
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    nye.forEach(item => {
        const rawEmail = item["E-post"]?.trim();
        const containsMultiple = rawEmail?.includes(",") || rawEmail?.includes(";") || rawEmail?.includes(" ");
    
        if (!emailRegex.test(rawEmail) || containsMultiple) {
            alert(`Ugyldig e-postadresse for selskapet ${item["Selskap"]} (${item["Org.nr"]}). Vennligst sjekk e-postfeltet.`);
            //dette item skal fjernes fra nye listen og legges til i feil listen
            feil.push(item);
            const index = nye.indexOf(item);
            if (index > -1) {
                nye.splice(index, 1);
            }

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
    const feilHTML = generateStyledList(`Selskaper med feil i e-post (${feil.length})`, feil, "orange");
    const nyeHTML = generateStyledList(`Nye selskaper (${nye.length})`, nye, "darkgreen");

    container.insertAdjacentHTML("beforeend", eksisterendeHTML+ feilHTML + nyeHTML);
}

function controllXlsInviteExisting(data) {
    gExistingMatchesToInvite = [];
    readyComsomerlist = [];
    gPendingExistingInvitations = [];

    const eksisterendeMedMatch = [];
    const nyeSomMaaOpprettes = [];
    const feil = [];

    data.sort((a, b) => {
        const nameA = a["Selskap"]?.trim().toLowerCase() || "";
        const nameB = b["Selskap"]?.trim().toLowerCase() || "";
        return nameA.localeCompare(nameB, 'no', { sensitivity: 'base' });
    });

    data.forEach(item => {
        const orgnr = item["Org.nr"]?.trim();
        const match = orgnr
            ? gCustomers.find(c => c.orgnr?.trim() === orgnr)
            : null;
        if (match) {
            eksisterendeMedMatch.push({
                xlsRow: item,
                customerAirtable: match.airtable,
                customerName: match.Name
            });
        } else {
            nyeSomMaaOpprettes.push(item);
        }
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isInvalidEmail = (xls) => {
        const rawEmail = xls["E-post"]?.trim();
        const containsMultiple = rawEmail?.includes(",") || rawEmail?.includes(";") || rawEmail?.includes(" ");
        return !emailRegex.test(rawEmail) || containsMultiple;
    };

    for (let i = eksisterendeMedMatch.length - 1; i >= 0; i--) {
        if (isInvalidEmail(eksisterendeMedMatch[i].xlsRow)) {
            feil.push(eksisterendeMedMatch[i].xlsRow);
            eksisterendeMedMatch.splice(i, 1);
        }
    }
    for (let i = nyeSomMaaOpprettes.length - 1; i >= 0; i--) {
        if (isInvalidEmail(nyeSomMaaOpprettes[i])) {
            feil.push(nyeSomMaaOpprettes[i]);
            nyeSomMaaOpprettes.splice(i, 1);
        }
    }

    if (feil.length > 0) {
        alert(`Fant ${feil.length} rad(er) med ugyldig e-post. Disse hoppes over.`);
    }

    gExistingMatchesToInvite = eksisterendeMedMatch;
    readyComsomerlist = nyeSomMaaOpprettes;

    const container = document.getElementById("resultlist");
    container.innerHTML = "";
    container.style.display = "inline-block";

    const totalRader = eksisterendeMedMatch.length + nyeSomMaaOpprettes.length + feil.length;
    const totalInvitasjoner = eksisterendeMedMatch.length + nyeSomMaaOpprettes.length;
    const harNye = nyeSomMaaOpprettes.length > 0;

    const summaryHTML = `
        <div style="background:#fff; border:1px solid #d0d7de; border-radius:10px; padding:16px 20px; margin-bottom:16px; color:#24292f; max-width:720px;">
            <h2 style="margin:0 0 12px 0; font-size:1.15rem;">Analyserapport av importfil</h2>
            <div style="display:grid; grid-template-columns:1fr auto; gap:6px 16px; font-size:0.95rem;">
                <span>Totalt antall rader i fil:</span><strong>${totalRader}</strong>
                <span style="color:#0a5ea8;">Eksisterende selskaper – inviteres direkte:</span><strong style="color:#0a5ea8;">${eksisterendeMedMatch.length}</strong>
                <span style="color:#1b5e20;">Nye selskaper – opprettes før invitasjon:</span><strong style="color:#1b5e20;">${nyeSomMaaOpprettes.length}</strong>
                <span style="color:#b26a00;">Rader med ugyldig e-post (hoppes over):</span><strong style="color:#b26a00;">${feil.length}</strong>
                <span style="border-top:1px solid #eaeef2; padding-top:6px;">Antall invitasjoner som vil bli sendt:</span><strong style="border-top:1px solid #eaeef2; padding-top:6px;">${totalInvitasjoner}</strong>
            </div>
        </div>
    `;
    container.insertAdjacentHTML("beforeend", summaryHTML);

    if (totalInvitasjoner > 0) {
        const actionWrapper = document.createElement("div");
        actionWrapper.id = "inviteExistingActionArea";

        let stepsHTML;
        if (harNye) {
            stepsHTML = `
                <div id="inviteExistingProcessCard" style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:10px; padding:14px 18px; margin-bottom:16px; color:#24292f; max-width:720px;">
                    <h3 style="margin:0 0 10px 0; font-size:1rem;">Prosessen består av 2 steg:</h3>
                    <ol style="margin:0; padding-left:20px; font-size:0.93rem; line-height:1.55;">
                        <li style="margin-bottom:6px;"><strong>Steg 1 (knapp nedenfor):</strong> Opprett ${nyeSomMaaOpprettes.length} manglende selskap${nyeSomMaaOpprettes.length === 1 ? "" : "er"} i databasen.</li>
                        <li style="margin-bottom:6px;"><strong>Steg 2 (ny knapp vises etter steg 1):</strong> Opprett ${totalInvitasjoner} invitasjon${totalInvitasjoner === 1 ? "" : "er"}, generer unik invitasjonslenke og send e-post til ${totalInvitasjoner} kontaktperson${totalInvitasjoner === 1 ? "" : "er"}.</li>
                    </ol>
                    <p style="margin:10px 0 0 0; font-size:0.85rem; color:#57606a; font-style:italic;">Fremdriften vises i statusfeltene under mens prosessen kjører.</p>
                </div>
            `;
        } else {
            stepsHTML = `
                <div id="inviteExistingProcessCard" style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:10px; padding:14px 18px; margin-bottom:16px; color:#24292f; max-width:720px;">
                    <h3 style="margin:0 0 10px 0; font-size:1rem;">Slik kjøres prosessen når du trykker knappen:</h3>
                    <ol style="margin:0; padding-left:20px; font-size:0.93rem; line-height:1.55;">
                        <li style="margin-bottom:4px;">Opprett ${totalInvitasjoner} invitasjon${totalInvitasjoner === 1 ? "" : "er"} koblet til riktig selskap.</li>
                        <li style="margin-bottom:4px;">Generer unik invitasjonslenke og send e-post til ${totalInvitasjoner} kontaktperson${totalInvitasjoner === 1 ? "" : "er"}.</li>
                    </ol>
                    <p style="margin:10px 0 0 0; font-size:0.85rem; color:#57606a; font-style:italic;">Fremdriften vises i statusfeltene under mens prosessen kjører.</p>
                </div>
            `;
        }
        actionWrapper.insertAdjacentHTML("beforeend", stepsHTML);

        const importButton = document.createElement("button");
        importButton.id = "inviteExistingStartButton";
        importButton.textContent = harNye
            ? "Opprett de manglende selskaper"
            : `Send ${totalInvitasjoner} invitasjon${totalInvitasjoner === 1 ? "" : "er"}`;
        importButton.style.marginBottom = "16px";
        importButton.style.padding = "10px 20px";
        importButton.style.backgroundColor = "#1b5e20";
        importButton.style.color = "#fff";
        importButton.style.border = "none";
        importButton.style.borderRadius = "8px";
        importButton.style.cursor = "pointer";
        importButton.style.fontSize = "0.95rem";
        importButton.style.fontWeight = "600";
        importButton.addEventListener("click", () => {
            importButton.disabled = true;
            importButton.style.opacity = "0.6";
            importButton.style.cursor = "not-allowed";
            importInviteExistingFlow();
        });
        actionWrapper.appendChild(importButton);
        container.appendChild(actionWrapper);
    }

    const matchHTML = generateMatchStyledList(
        `Eksisterende selskaper – inviteres direkte (${eksisterendeMedMatch.length})`,
        eksisterendeMedMatch,
        "#0a5ea8"
    );
    const nyeHTML = generateStyledList(
        `Nye selskaper – opprettes før invitasjon (${nyeSomMaaOpprettes.length})`,
        nyeSomMaaOpprettes,
        "#1b5e20"
    );
    const feilHTML = generateStyledList(
        `Rader med ugyldig e-post (${feil.length})`,
        feil,
        "#b26a00"
    );

    container.insertAdjacentHTML("beforeend", matchHTML + nyeHTML + feilHTML);
}

function importInviteExistingFlow() {
    const selector = document.getElementById("groupSelector");
    const selectedGroup = selector.value;
    if (selectedGroup === "") {
        alert("Vennligst velg en gruppe før du importerer.");
        return;
    }

    const TermsofServiceSelectorValue = document.getElementById("TermsofServiceSelector").value;

    const existingInvitations = gExistingMatchesToInvite.map(m => ({
        navn: m.xlsRow["Kontaktperson"],
        telefon: m.xlsRow["Telefon"],
        epost: m.xlsRow["E-post"],
        avsender: [userid],
        rolle: "Admin",
        firma: [m.customerAirtable],
        vilkar: [TermsofServiceSelectorValue]
    }));

    if (readyComsomerlist.length > 0) {
        gPendingExistingInvitations = existingInvitations;
        importCustomerList(readyComsomerlist);
    } else if (existingInvitations.length > 0) {
        sendCollection = "invitation";
        multisave(existingInvitations, "app1WzN1IxEnVu3m0", "tblc1AGhwc6MMu4Aw", "retunrMultiImportInvitations");
    } else {
        alert("Ingen gyldige rader å importere.");
    }
}

function importCustomerList(nye) {
    console.log("Importerer nye selskaper:", nye);
    

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

        let ansattfordeler = document.getElementById('benefitsSwitsh').checked;

        return {
            Name: item["Selskap"]?.trim() || "",
            orgnr: item["Org.nr"]?.trim() || "",
            adresse,
            postnr,
            poststed,
            gruppe: [selectedGroup],
            klient:["rec1QGUGBMVaqxhp1"],
            ansattfordeler:document.getElementById('benefitsSwitsh').checked || false,
        };
    });

    console.log("Formatert data (klare for import):", savedata);

    sendCollection = "customer";

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

        let TermsofServiceSelectorValue = document.getElementById("TermsofServiceSelector").value

        if (match) {
            invitations.push({
                navn: item["Kontaktperson"],
                telefon: item["Telefon"],
                epost: item["E-post"],
                avsender: [userid],
                rolle: "Admin",
                firma: [match.airtable],
                vilkar:[TermsofServiceSelectorValue]
            });
        }
    });

    if (gImportMode === "inviteExisting" && gPendingExistingInvitations.length > 0) {
        invitations.push(...gPendingExistingInvitations);
        gPendingExistingInvitations = [];
    }

    console.log("Invitations som skal importeres:", invitations);

    if (gImportMode === "inviteExisting") {
        //pause – vis bekreftelse på at selskapene er opprettet, og vent på at bruker klikker "Send invitasjoner"
        showInvitationConfirmation(invitations, allRecords.length);
        return;
    }

    //sjekke om switsjen med kun oprettelse av selskap er slått på
    let onlyEmailSwitsh = document.getElementById('onlyEmailSwitsh').checked;
    if(onlyEmailSwitsh && gImportMode !== "inviteExisting"){
        //hoppe over invitasjons opprettelse og gå direkte til mail sending
        multiOnlyEmailSending(readyComsomerlist);

    }else{

        sendCollection = "invitation";
        multisave(invitations, "app1WzN1IxEnVu3m0", "tblc1AGhwc6MMu4Aw", "retunrMultiImportInvitations");

    }


}

function showInvitationConfirmation(invitations, antallOpprettet) {
    gPendingInvitationsToSend = invitations;

    const invPlural = invitations.length === 1 ? "" : "er";
    const selskapPlural = antallOpprettet === 1 ? "" : "er";

    //fjern steg 1-knappen slik at brukeren ikke forholder seg til den mer
    const startBtn = document.getElementById("inviteExistingStartButton");
    if (startBtn) startBtn.remove();

    const confirmBlock = document.createElement("div");
    confirmBlock.id = "inviteExistingStep2Block";
    confirmBlock.innerHTML = `
        <div style="background:#e6f4ea; border:1px solid #34a853; border-radius:10px; padding:16px 20px; margin-bottom:16px; color:#1b5e20; max-width:720px;">
            <h2 style="margin:0 0 8px 0; font-size:1.1rem;">✓ Steg 1 fullført</h2>
            <p style="margin:0 0 8px 0;">${antallOpprettet} nytt selskap${selskapPlural} er opprettet i databasen.</p>
            <p style="margin:0;">Neste steg: Opprett ${invitations.length} invitasjon${invPlural} og send e-post med invitasjonslenke til kontaktpersonene. Klikk knappen under for å starte.</p>
        </div>
    `;

    const sendButton = document.createElement("button");
    sendButton.id = "inviteExistingSendButton";
    sendButton.textContent = `Send ${invitations.length} invitasjon${invPlural}`;
    sendButton.style.marginBottom = "16px";
    sendButton.style.padding = "10px 20px";
    sendButton.style.backgroundColor = "#1b5e20";
    sendButton.style.color = "#fff";
    sendButton.style.border = "none";
    sendButton.style.borderRadius = "8px";
    sendButton.style.cursor = "pointer";
    sendButton.style.fontSize = "0.95rem";
    sendButton.style.fontWeight = "600";
    sendButton.addEventListener("click", () => {
        sendButton.disabled = true;
        sendButton.style.opacity = "0.6";
        sendButton.style.cursor = "not-allowed";
        sendPendingInvitations();
    });
    confirmBlock.appendChild(sendButton);

    //plasser steg 2-blokken rett under prosess-kortet, ikke nederst i containeren
    const processCard = document.getElementById("inviteExistingProcessCard");
    if (processCard) {
        processCard.insertAdjacentElement("afterend", confirmBlock);
    } else {
        document.getElementById("resultlist").appendChild(confirmBlock);
    }
}

function sendPendingInvitations() {
    if (!gPendingInvitationsToSend || gPendingInvitationsToSend.length === 0) {
        alert("Ingen invitasjoner å sende.");
        return;
    }
    sendCollection = "invitation";
    multisave(gPendingInvitationsToSend, "app1WzN1IxEnVu3m0", "tblc1AGhwc6MMu4Aw", "retunrMultiImportInvitations");
    gPendingInvitationsToSend = [];
}

function multiOnlyEmailSending(data) {

      // Hent innholdet fra TinyMCE editoren
      var editorContent = tinymce.get("mailbodyelement").getContent();

    const selector = document.getElementById("groupSelector");
    const selectedGroup = selector.value;

    //finn gruppe i gGroups
    const group = gGroups.find(group => group.airtable === selectedGroup);
    let groupEmail = group.email || "";

    //skal denne invitasjonen også registreres i pipedrive
    let pipedrivestagestartid = group.pipedrivestagestartid || "";
     
      


    data.forEach(item => {

        let zapierData = {
            navn: item["Kontaktperson"],
            telefon: item["Telefon"],
            epost: item["E-post"],
            firmanavn: item["Selskap"],
            orgnr: item["Org.nr"],
            mailbody: editorContent || "",
            pipedrivestagestartid: pipedrivestagestartid,
            groupemail: groupEmail
        };

        sendUserToZapier(zapierData)

    });

}

function retunrMultiImportInvitations(data) {
    console.log("retunrMultiImportInvitations:", data);

    const allRecords = [];

    const selector = document.getElementById("groupSelector");
    const selectedGroup = selector.value;

    //finn gruppe i gGroups
    const group = gGroups.find(group => group.airtable === selectedGroup);
    let groupEmail = group.email || "";

    //skal denne invitasjonen også registreres i pipedrive
    let pipedrivestagestartid = group.pipedrivestagestartid || "";

    

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
                    groupemail: groupEmail,
                    telefon: fields.telefon || "",
                    pipedrivestagestartid: pipedrivestagestartid,
                });
            });
        }
    });

    console.log("Importer resultat (kun relevante nøkler):", allRecords);

    gInventations = allRecords;
    totalInvitations = allRecords.length;

    sendCollection = "email";
    //opprette public invitation link
    loopGenerateDataForPublickLink();


}

function loopGenerateDataForPublickLink() {

    //oppdatere status
    const statusProgressLabling = document.getElementById("statusProgressLabling");
    //finne hvor mange invitasjoner som er igjen
    const remainingInvitations = gInventations.length;
    statusProcessing(totalInvitations, totalInvitations - remainingInvitations);
    
    //sjekke om det er flere invitasjoner igjen
    if(gInventations.length == 0){
        //Ferdig å sende mail
    }else{
        //hente første element i gInventations
        const allRecords = gInventations;
        generateDataForPublickLink(allRecords[0]);
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
    generatePublicLink({ baseId, tableId, rowId, text, expirationdate: expirationdateFormatted },"responPostpublicLink",data);
}

function generatePublicLink(data,response,dObject) {
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
    POSTairtablepublicLinkInData(JSON.stringify(body), response,dObject);
}

function responPostpublicLink(data){

    let mailObject = data.dObject || {};
 
    // Sett href-attributtet til ønsket URL
    let link = "https://portal.innkjops-gruppen.no/app-portal?"+"shareKey="+data.shareKey+"&shareId="+data.shareId;
    console.log(link);
    //finne objectet i gInventations
    mailObject.link = link;

    // Hent innholdet fra TinyMCE editoren
    var editorContent = tinymce.get("mailbodyelement").getContent();
    mailObject.mailbody = editorContent;

    console.log(mailObject);

    // Send mail via Zapier
    sendUserToZapier(mailObject);
    

    //finne objectet med data i gInventations og slette det
    const index = gInventations.findIndex(item => item.airtable === mailObject.airtable);
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
        console.log("Data sent to Zapier successfully.");
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
        html += `<li style="color: ${color}; padding: 4px 0;">${item["Selskap"]} (${item["Org.nr"]}) ${item["E-post"]}</li>`;
    });

    html += `</ul>`;
    return html;
}

function generateMatchStyledList(title, list, color) {
    let html = `<h3>${title}</h3>`;
    html += `<p style="color:${color}; font-size: 0.9em; font-style: italic; margin-top: -10px; margin-bottom: 10px;">Antall: ${list.length}</p>`;

    if (list.length === 0) {
        html += `<p style="color:${color};">Ingen</p>`;
        return html;
    }

    html += `<ul style="list-style: none; padding-left: 0;">`;
    list.forEach(item => {
        const xls = item.xlsRow;
        html += `<li style="color: ${color}; padding: 4px 0;">${xls["Selskap"]} (${xls["Org.nr"]}) ${xls["E-post"]} → <strong>${item.customerName}</strong></li>`;
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

function statusProcessing(totalRows, uploadedRows) {
    let statusEl;

    const doneMessage = (text, count) =>
        `<strong style="font-size: 1.1rem; color: green; opacity: 0; transition: opacity 0.5s;">✔️ ${count} ${text} – Ferdig!</strong>`;

    const progressMessage = (text, current, total) =>
        `<strong style="font-size: 1.1rem;">${text}</strong> (${current} av ${total})`;

    if (sendCollection === "customer") {
        statusEl = document.getElementById("statusCustomersUploading");
        if (!statusEl) return;

        if (uploadedRows >= totalRows) {
            statusEl.innerHTML = doneMessage("selskaper opprettet i databasen", uploadedRows);
            requestAnimationFrame(() => statusEl.firstChild.style.opacity = 1);
        } else {
            statusEl.innerHTML = progressMessage("Oppretter selskaper i databasen", uploadedRows, totalRows);
        }

    } else if (sendCollection === "invitation") {
        statusEl = document.getElementById("statusInvitation");
        if (!statusEl) return;

        if (uploadedRows >= totalRows) {
            statusEl.innerHTML = doneMessage("invitasjoner opprettet", uploadedRows);
            requestAnimationFrame(() => statusEl.firstChild.style.opacity = 1);
        } else {
            statusEl.innerHTML = progressMessage("Oppretter invitasjoner", uploadedRows, totalRows);
        }

    } else if (sendCollection === "email") {
        statusEl = document.getElementById("statusEmailSending");
        if (!statusEl) return;

        if (uploadedRows >= totalRows) {
            statusEl.innerHTML = doneMessage("e-poster sendt", uploadedRows);
            requestAnimationFrame(() => statusEl.firstChild.style.opacity = 1);
        } else {
            statusEl.innerHTML = progressMessage("Sender e-poster", uploadedRows, totalRows);
        }
    }
}

async function multisave(data, baseid, tabelid, returid) {
    const batchSize = 10;
    const totalRows = data.length;
    let uploadedRows = 0;
    const allResponses = [];

    const sendBatch = async (batch) => {
        try {
            console.log("Sender batch:", batch);
            const response = await POSTairtableMulti(baseid, tabelid, batch);
            uploadedRows += batch.length;

            statusProcessing(totalRows, uploadedRows);
            allResponses.push(response);
        } catch (error) {
            console.error("Feil ved sending av batch:", error);
            throw error;
        }
    };

    const processBatches = async () => {
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            await sendBatch(batch);
        }

        statusProcessing(totalRows, uploadedRows);
        console.log("Alle rader er ferdig prosessert.");
    };

    try {
        statusProcessing(totalRows, uploadedRows);
        await processBatches();
        apireturn({ success: true, data: allResponses, id: returid });
    } catch (error) {
        console.error("Prosesseringen ble stoppet på grunn av en feil:", error);
        statusProcessing(totalRows, uploadedRows);
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


tinymce.init({
    selector: '#mailbodyelement',
    branding: false,
    plugins: [
        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media',
        'searchreplace', 'table', 'visualblocks', 'wordcount'
    ], 
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | numlist bullist indent outdent | emoticons charmap | removeformat',
    
    init_instance_callback: function (editor) {
        if (editor.id === "mailbodyelement") {
            editor.getContainer().style.height = "450px";
        }
        console.log(`TinyMCE lastet for ${editor.id} med høyde ${editor.getContainer().style.height}`);
        const element = tinymce.get("mailbodyelement");
        // Hent HTML-innholdet fra malone
        // og last det inn i TinyMCE-editoren
        loadContentIntoEditor(element,malonetext);
    },
    /*
    setup: function (editor) {
        editor.on('change', function () {
            handleEditorChange(editor.id);
        });

        editor.on('input', function () {
            handleEditorChange(editor.id);
        });
    }
        */


});

function loadContentIntoEditor(element,htmlContent) {
    

    if (!element) {
        console.error("TinyMCE-editoren er ikke lastet inn ennå.");
        return;
    }

    // Sett HTML-innholdet i TinyMCE
    element.setContent(htmlContent);

    // 🚀 Juster høyden basert på innholdets faktiske størrelse
   // setTimeout(() => adjustEditorHeight(), 300); // Vent litt slik at innholdet rendres først
}

malonetext = `
<p data-start="0" data-end="7"><strong>Hei</strong></p>
<p data-start="9" data-end="88">Du er invitert som bruker for&nbsp;i innkj&oslash;psportalen hos Innkj&oslash;psGruppen.</p>
<p data-start="90" data-end="144" data-is-last-node="">Klikk p&aring; lenken nedenfor for &aring; opprette brukeren din:</p>
`;
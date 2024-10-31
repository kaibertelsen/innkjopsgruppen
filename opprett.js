document.getElementById("searchinputfield").addEventListener("input", function() {
    const inputValue = this.value.trim();

    // Sjekk om det er mer enn 4 tegn
    if (inputValue.length > 4) {
        hentFirmaInfo(inputValue);
    }else{
        const responseArrayElement = document.getElementById("responsearray");
        responseArrayElement.innerHTML = ""; // Tøm listen før nye elementer legges til
    }
});

function searchCompany(){

    let searchinput = document.getElementById("searchinput").value;
    //sjekke om det er et selskap som alt har dette orgnummeret
    hentFirmaInfo(searchinput);
  
}

async function hentFirmaInfo(input) {
    // Sjekker om input er et organisasjonsnummer (9 sifre)
    const isOrgNr = /^\d{9}$/.test(input);
    
    let url;
    if (isOrgNr) {
        // Søk basert på organisasjonsnummer
        url = `https://data.brreg.no/enhetsregisteret/api/enheter/${input}`;
    } else {
        // Søk basert på navn
        url = `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURIComponent(input)}`;
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            hentFirmaData(data);
        } else {
            console.error('Feil ved henting av firmaopplysninger:', response.status);
        }
    } catch (error) {
        console.error('Nettverksfeil:', error);
    }
}

function hentFirmaData(responseData) {
    const enheter = responseData._embedded?.enheter || [];

    const responseArrayElement = document.getElementById("responsearray");
    responseArrayElement.innerHTML = ""; // Tøm listen før nye elementer legges til

    if (enheter.length > 0) {
        enheter.forEach(firma => {
            const navn = firma.navn;
            const adresse = firma.forretningsadresse ? firma.forretningsadresse.adresse.join(", ") : "Ingen adresse";

            // Opprett et HTML-element for firma med navn og adresse
            const firmaElement = document.createElement("div");
            firmaElement.classList.add("itemcompanynames");

            // Sett inn navn og adresse som tekstinnhold med 0px margin
            firmaElement.innerHTML = `
            <p style="margin: 0;"><strong>${navn}</strong></p>
            <p style="margin: 0;">${adresse}</p>
            `;

            // Legg til en klikkhendelse for å sende objektet til loadCompany
            firmaElement.addEventListener("click", () => loadCompany(firma));

            // Legg til firmaElement i responseArrayElement
            responseArrayElement.appendChild(firmaElement);
        });
    } else {
        console.log("Ingen enheter funnet i responsen.");
    }
}

function loadCompany(companyObject) {
    const responseArrayElement = document.getElementById("responsearray");
           responseArrayElement.innerHTML = ""; // Tøm listen før nye elementer legges til
       // Hent ut nødvendige data fra companyObject
       const navn = companyObject.navn || "";
       const adresse = companyObject.forretningsadresse ? companyObject.forretningsadresse.adresse.join(", ") : "";
       const postnummer = companyObject.forretningsadresse ? companyObject.forretningsadresse.postnummer : "";
       const poststed = companyObject.forretningsadresse ? companyObject.forretningsadresse.poststed : "";
       const orgnummer = companyObject.organisasjonsnummer || "";
   
       // Sett verdiene i input-feltene
       document.getElementById("firmanavninput").value = navn;
       document.getElementById("adresseinput").value = adresse;
       document.getElementById("postnrinput").value = postnummer;
       document.getElementById("poststedinput").value = poststed;
       document.getElementById("orgnumberinput").value = orgnummer;
   
      let body =  airtablebodylistAND({orgnr:orgnummer});
      Getlistairtable("app1WzN1IxEnVu3m0","tblFySDb9qVeVVY5c",body,"companycheck");
      document.getElementById("animationcompany").style.display = "block";
      
}

function companycheck(data) {
    // Rens dataene først og hente ut første treff
    let response = rawdatacleaner(data);
    console.log(response);
    document.getElementById("animationcompany").style.display = "none";
    let portalresponsdiv = document.getElementById("responseportal");

    // Tøm portalresponsdiv for å unngå duplikatinnhold
    portalresponsdiv.innerHTML = '';

    // Sjekk om response har data
    if (response.length > 0) {
        // Hvis selskapet allerede er registrert, vis informasjon og knapper
        const company = response[0]; // Forutsatt at vi sjekker det første objektet i listen
        setCompanyselectors(company);
        companyId = company.airtable;
        const name = company.Name || "Navn ikke tilgjengelig";
        const orgnr = company.orgnr || "Org.nr ikke tilgjengelig";
        // Vis selskapets informasjon med linjeskift
        const infoText = document.createElement('p');
        infoText.textContent = `Selskapet er allerede registrert i portalen:\nNavn: ${name}\nOrg.nr: ${orgnr}`;
        infoText.style.whiteSpace = "pre-line"; // Tillat linjeskift
        portalresponsdiv.appendChild(infoText);
        // Opprett knappene
        const createCompanyButton = document.createElement('button');
        createCompanyButton.textContent = "Oppdater selskap";
        createCompanyButton.classList.add("buttoncreate");
        createCompanyButton.onclick = updateCompanysetppOne;
        const addUserButton = document.createElement('button');
        addUserButton.textContent = "Inviter bruker";
        addUserButton.classList.add("buttoncreate");
        addUserButton.onclick = () => creatUserOnCompany(addUserButton);
        // Legg knappene til i portalresponsdiv
        portalresponsdiv.appendChild(createCompanyButton);
        portalresponsdiv.appendChild(addUserButton);
        document.getElementById("mycompanyinputwrapper").style.display = "none";
        document.getElementById("createCompanybutton").textContent = "Oppdater selskap";
    } else {
        companyId = "";
        // Hvis selskapet ikke er registrert tidligere
        portalresponsdiv.textContent = "Dette selskapet er ikke tidligere registrert i portalen.";
        document.getElementById("mycompanyinputwrapper").style.display = "block";
        document.getElementById("createCompanybutton").textContent = "Opprett selskap";
        const logoImage = document.getElementById("logo-image");
        logoUrl = "";
        if (logoImage) {
            logoImage.style.display = "none";
            logoImage.src = "";
        }

    }
}

function setCompanyselectors(data) {
    // Kartlegging av data-nøkler til select-element-ID-er
    const selectMap = {
        gruppe: 'group',
        radgiver: 'ownerinput',
        valuegroup: 'valueselector'
    };

    // Itererer gjennom selectMap for å sette verdier i select-elementer
    Object.keys(selectMap).forEach(key => {
        const selectId = selectMap[key];
        const selectElement = document.getElementById(selectId);

        // Sjekk at select-elementet finnes og at data[key] har en verdi
        if (selectElement && data[key]) {
            // Hent verdien, håndterer både array og enkeltverdi
            const valueToSelect = Array.isArray(data[key]) ? data[key][0] : data[key];

            // Finn alternativ i select-elementet som samsvarer med valueToSelect
            const optionToSelect = Array.from(selectElement.options).find(option => option.value == valueToSelect);

            // Hvis alternativet finnes, sett select-elementet til denne verdien
            if (optionToSelect) {
                selectElement.value = optionToSelect.value;
            }
        }
    });

    // Sjekk og sett verdi for "valuegroup" i input-feltet med id "verdi"
    if (data.valuegroup) {
        const valueInput = document.getElementById("verdi");
        if (valueInput) {
            valueInput.value = data.valuegroup;
        }
    }

    // Sjekk og last inn logoen hvis den finnes i data
    if (data.logo && Array.isArray(data.logo) && data.logo.length > 0) {
        const logoImage = document.getElementById("logo-image");
        if (logoImage) {
            logoImage.src = data.logo[0].url; // Bruker URL-en til første logo i arrayet
            logoImage.style.display = "in-block"; // Gjør logoen synlig
        }
    }
}

function updateCompanysetppOne(){
    // Gjør wrapper-elementet synlig
    const wrapperElement = document.getElementById("mycompanyinputwrapper");
    wrapperElement.style.display = "block";

    let portalresponsdiv = document.getElementById("responseportal");
    portalresponsdiv.innerHTML = '';

}

function creatUserOnCompany(button){
    button.style.display = "none";
    document.getElementById("userwrapper").style.display = "block";
}

document.getElementById("createCompanybutton").onclick = function() {
createCompany();
}

function createCompany(){
 let body = controllcompanyinputs();
    if(body){

        if(companyId == ""){
        POSTairtable("app1WzN1IxEnVu3m0","tblFySDb9qVeVVY5c",JSON.stringify(body),"responsecompany");
        }else{
        PATCHairtable("app1WzN1IxEnVu3m0","tblFySDb9qVeVVY5c",companyId,JSON.stringify(body),"responsecompany");
        }

        document.getElementById("animationcompany").style.display = "block";
    }
}

function responsecompany(data) {


    //oppdatert i airtable
    document.getElementById("loadingtext").style.display = "block";
    document.getElementById("loadingtext").innerHTML = "Opprettet i airtable<br>venter på link fra webflow...";
    // Oppdater i Webflow også
    let companyObject = data.fields || {}; // Sikrer at fields eksisterer

    // Bygg body dynamisk basert på eksisterende felter
    const body = {};

    if (companyObject.Name) body.Name = companyObject.Name;
    if (companyObject.adresse) body.adresse = companyObject.adresse;
    if (companyObject.postnr) body.postnr = companyObject.postnr;
    if (companyObject.poststed) body.poststed = companyObject.poststed;
    if (companyObject.airtable) body.airtable = companyObject.airtable;
    if (companyObject.webflowId) body.webflow = companyObject.webflowId;
    if (companyObject.orgnr) body.orgnr = companyObject.orgnr;
    if (companyObject.logourl) body.logo = companyObject.logourl;
    if (companyObject.gruppewebflowId && companyObject.gruppewebflowId.length > 0) {
        body.gruppe = companyObject.gruppewebflowId[0];
    }
    if (companyObject.radgiverwebflowId && companyObject.radgiverwebflowId.length > 0) {
        body.radgiver = companyObject.radgiverwebflowId[0];
    }

    if(companyObject?.valuegroup){
        body.valuegroup = companyObject.valuegroup
    }

    if(companyObject?.ownerpipedriveid){
        body.ownerpipedriv = companyObject.ownerpipedriveid[0];
    }

    sendToZapier(body);

    if (companyObject.slug){
    //da er dette en oppdatering
    companycreateFinish(companyObject);
    }else{
        //sett igang å sjekk med 3 sek mellomrom om det er slug object i companyobject
        getslugfromairtable(companyObject.airtable);
    }
}

function getslugfromairtable(airtableid){
    GETairtable("app1WzN1IxEnVu3m0","tblFySDb9qVeVVY5c",airtableid,"responseslug")
}

function responseslug(data) {
    if (data.fields?.slug) {
        companycreateFinish(data.fields);
    } else {
        setTimeout(() => {
            getslugfromairtable(data.fields.airtable);
        }, 3000);
    }
}

function companycreateFinish(data) {

    document.getElementById("loadingtext").style.display = "none";
    document.getElementById("animationcompany").style.display = "none";



    let portalresponsdiv = document.getElementById("responseportal");
    portalresponsdiv.innerHTML = '';

    // Tekst som vises
    const message = document.createElement("p");
    message.textContent = "Selskapet er oppdatert";
    portalresponsdiv.appendChild(message);

    // Lag en link
    const link = document.createElement("a");
    link.textContent = "til portal med " + data.Name;
    link.href = "https://portal.innkjops-gruppen.no/firma/" + data.slug; // Antar 'slug' finnes i data-objektet
    link.target = "_blank"; // Åpner i ny fane
    portalresponsdiv.appendChild(link);

    // Legger til linjeskift etter linken
    portalresponsdiv.appendChild(document.createElement("br"));
    portalresponsdiv.appendChild(document.createElement("br"));

    // Skjul input wrapper
    document.getElementById("mycompanyinputwrapper").style.display = "none";

    // Lag knappen
    const addUserButton = document.createElement("button");
    addUserButton.textContent = "Legg til bruker";
    addUserButton.classList.add("buttoncreate");
    addUserButton.onclick = () => creatUserOnCompany(addUserButton);
    
    // Legg knappen til under linken
    portalresponsdiv.appendChild(addUserButton);
}

function controllcompanyinputs() {
    let fieldIds = [
        firmanavninput,
        adresseinput,
        postnrinput,
        poststedinput,
        orgnumberinput,
        verdi,
        ownerinput,
        group
    ];

    let saveObject = {};
    for (let i = 0; i < fieldIds.length; i++) {
        if (fieldIds[i].value === "") { // Sjekker om feltet mangler verdi
            let fieldName = fieldIds[i].name;
            alert("Feltet " + fieldName + " mangler verdi");
            return false;
        } else {
            let dataName = fieldIds[i].dataset.name;
            if (dataName == "valuegroup") {
                let numberValue = parseFloat(fieldIds[i].value);
                if (isNaN(numberValue)) { // Sjekker om verdien ikke er et tall
                    numberValue = 0;
                }
                saveObject[dataName] = numberValue; // Lagre som tall
            } 
            // Legg verdien i en array hvis dataName er "gruppe" eller "radgiver"
            else if (dataName === "gruppe" || dataName === "radgiver") {
                saveObject[dataName] = [fieldIds[i].value];
            } else {
                saveObject[dataName] = fieldIds[i].value;
            }
        }
    }

    if(logoUrl != ""){
        saveObject.logo = [
            {
                "url": logoUrl
            }
        ]
        saveObject.logourl = logoUrl;
    }

    return saveObject;
}

async function sendToZapier(data) {
    


    const formData = new FormData();
    for (const key in data) {
        const value = data[key];
        // Sjekk om verdien er en array eller objekt og stringify hvis nødvendig
        formData.append(key, Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : value);
    }

    const response = await fetch("https://hooks.zapier.com/hooks/catch/10455257/29whqiz/", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        console.log("Data sent to Zapier successfully!");
    } else {
        console.error("Error sending data to Zapier:", response.statusText);
    }
}





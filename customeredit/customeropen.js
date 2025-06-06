var gUsers = [];
var gSuppliers = [];
var gConnection = [];

document.getElementById("backtolistbutton").addEventListener("click", function () {
    document.getElementById("supplierListTagbutton").click();
});

function openCustomer(customer){

    activeCustomer = customer;

   //tømme userlist
    document.getElementById("userListConteiner").innerHTML = "";

    //tømme connectingList
    document.getElementById("connectingList").innerHTML = "";

    document.getElementById("newConnectionConteiner").style.display = "none";

    document.getElementById("getconnectionsButton").style.display = "inline-block";

    //åpne 
    document.getElementById("itemTagbutton").click();

    const supplierPageConteiner = document.getElementById("supplierPageConteiner");

    const publicSwitsh = document.getElementById("publicSwitsh");
    publicSwitsh.checked = customer.inactive ? false : true;

    const benefitsSwitsh = document.getElementById("benefitsSwitsh");
    benefitsSwitsh.checked = customer.ansattfordeler ? true : false;

    const publicSwitshtext = document.getElementById("publicSwitshtext");
    publicSwitshtext.textContent = customer.inactive ? "Deaktivert" : "Aktivert";
    
    const suppliernamepage = document.getElementById("customerNameInput");
    suppliernamepage.value = customer.Name || "";

    const supplierNameOrgnr = document.getElementById("customerNameOrgnr");
    supplierNameOrgnr.value = customer.orgnr || "";

    const customerAdress = document.getElementById("customerAdress");
    customerAdress.value = customer.adresse || "";

    const inputpostnumber = document.getElementById("inputpostnumber");
    inputpostnumber.value = customer.postnr || "";

    const inputpostplace = document.getElementById("inputpostplace");
    inputpostplace.value = customer.poststed || "";

    const supplierlogo = supplierPageConteiner.querySelector(".supplierlogo");
    supplierlogo.src = customer.logo || "https://cdn.prod.website-files.com/6346cf959f8b0bccad5075af/67c84fa2f53230648774dd1b_dummy-image-landscape-1024x585.jpg";

    const customerGroupSelector = document.getElementById("customerGroupSelector");
    //finner hvilke gruppe selskapet tilhører og velg den i selector
    customerGroupSelector.value = customer.group;

    const parentCompany = document.getElementById("hovedselskapinput");
    parentCompany.value = customer.parentcompanyname || "";
    parentCompany.dataset.airtable = customer.parentcompany || "";


    listUsersOnCustomer(customer);
   






    /*
    const offerlable = document.getElementById("offerlable");
    offerlable.value = supplier.cuttext

    var shorttextArea = tinymce.get("shorttextArea");
    loadContentIntoEditor(shorttextArea,supplier.kortinfo);

    const contentInfoelement = tinymce.get("contentInfoelement");
    loadContentIntoEditor(contentInfoelement,supplier.info);
    orginaltext = supplier.info;

    loadAttachmentList(supplier.attachment);
    gAttachments = supplier.attachment;
    listGroups(supplier.group);

    listCategorys(supplier.category);

    const urltosupplierweb = document.getElementById("urltosupplierweb");
    urltosupplierweb.value = supplier.landingsside;

    const presentationImageSupplier = document.getElementById("presentationImageSupplier");
    presentationImageSupplier.src = supplier.image || "https://cdn.prod.website-files.com/6346cf959f8b0bccad5075af/67c84fa2f53230648774dd1b_dummy-image-landscape-1024x585.jpg";
    
    //last inn outputs i select
    const deliveryMethodSelector = document.getElementById("deliveryMethodSelector");
    deliveryMethodSelector.innerHTML = "";
    deliveryMethodSelector.options.add(new Option("Velg leveringsmetode", ""));
    gOutputs.forEach(output => {
        deliveryMethodSelector.options.add(new Option(output.Name, output.airtable));
    });

    */
  
}

function listUsersOnCustomer(customer){

    const listContainer = document.getElementById("userListConteiner");
    listContainer.innerHTML = "";

    const nodeElement = document.getElementById("elementlibrarywrapper").querySelector('.user');
    
    if (!nodeElement) {
        console.error("Template element not found");
        return;
    }

    //sorter etter rolle deretter alfabetisk på navn
    customer.bruker.sort((a, b) => a.rolle.localeCompare(b.rolle) || a.navn.localeCompare(b.navn));

    //list alle brukere på dette selskapet
    customer.bruker.forEach(user => {

        const rowElement = nodeElement.cloneNode(true);
        
        const userName = rowElement.querySelector(".username");
        userName.textContent = user.navn || "Ukjent navn";

        const userRoll = rowElement.querySelector(".rolle");
        userRoll.textContent = user.rolle || "Ukjent rolle";

        const userEmail = rowElement.querySelector(".usermail");
        userEmail.textContent = user.epost || "Ukjent e-post";

        const removeuserbutton = rowElement.querySelector(".removeuserbutton");
        removeuserbutton.addEventListener("click", function() {
            removeUserFromCustomer(user, customer,rowElement);
        });

        listContainer.appendChild(rowElement);

    }
    );
}

function removeUserFromCustomer(user, customer,rowElement) {

    //en alert for å bekrefte at brukeren skal fjernes
    if (!confirm(`Er du sikker på at du vil fjerne ${user.navn} fra ${customer.Name}?`)) {
        return;
    }
    // Fjern brukeren fra kundens brukerliste
    const updatedUsers = customer.bruker.filter(existingUser => existingUser.epost !== user.epost);
    customer.bruker = updatedUsers;

    //skal kun ha airtable til brukerne i updatedUsers
    const updatedUsersAirtable = updatedUsers.map(user => user.airtable);

    // Lagre endringene i databasen
    saveSupplierInfo(customer.airtable, {bruker: updatedUsersAirtable});

    // Fjern raden fra brukerlisten
    rowElement.remove();
}

document.getElementById("publicSwitsh").addEventListener("click", function () {
    const publicSwitshtext = document.getElementById("publicSwitshtext");
    // sjekke om den er checked
    if(this.checked){
        publicSwitshtext.textContent = "Aktivert";
        saveSupplierInfo(activeCustomer.airtable, {inactive: false});
        //save lokalt
        activeCustomer.inactive = false;
    }else{
        publicSwitshtext.textContent = "Deaktivert";
        saveSupplierInfo(activeCustomer.airtable, {inactive: true});
        //save lokalt
        activeCustomer.inactive = true;
    }
});

document.getElementById("benefitsSwitsh").addEventListener("click", function () {
    // sjekke om den er checked
    if(this.checked){
        saveSupplierInfo(activeCustomer.airtable, {ansattfordeler: true});
        //save lokalt
        activeCustomer.ansattfordeler = true;
    }else{
        saveSupplierInfo(activeCustomer.airtable, {ansattfordeler: false});
        //save lokalt
        activeCustomer.ansattfordeler = false;
    }
});

document.getElementById("customerNameInput").addEventListener("blur", function() {
    // Lagre innholdet i databasen
    saveSupplierInfo(activeCustomer.airtable, {Name: this.value});

    // Lagre innholdet lokalt
    activeCustomer.Name = this.value;

    startupCustomerList(gCustomers);

});

document.getElementById("customerNameOrgnr").addEventListener("blur", function() {
    //kontroller at det kun er nummer
    if (!/^\d+$/.test(this.value)) {
        alert("Orgnr kan kun inneholde tall.");
        this.value = activeSupplier.orgnr || "";
        return;
    }


    // Lagre innholdet i databasen
    saveSupplierInfo(activeCustomer.airtable, {orgnr: this.value});

    // Lagre innholdet lokalt
    activeCustomer.orgnr = this.value;
});

document.getElementById("customerAdress").addEventListener("blur", function() {
    //kontroller at det er mer en 3 tegn
    if (this.value.length < 3) {
        alert("Adresse må inneholde minst 3 tegn.");
        this.value = activeSupplier.adresse || "";
        return;
    }
   

    // Lagre innholdet i databasen
    saveSupplierInfo(activeCustomer.airtable, {adresse: this.value});

    // Lagre innholdet lokalt
    activeCustomer.adresse = this.value;
});

document.getElementById("inputpostnumber").addEventListener("blur", function() {
    //kontroller at det er 4 tegn og kun nummer
    if (!/^\d{4}$/.test(this.value)) {
        alert("Postnummer må være 4 siffer.");
        this.value = activeSupplier.postnr || "";
        return;
    }
   

    // Lagre innholdet i databasen
    saveSupplierInfo(activeCustomer.airtable, {postnr: this.value});

    // Lagre innholdet lokalt
    activeCustomer.postnr = this.value;
});

document.getElementById("inputpostplace").addEventListener("blur", function() {
    //kontroller at det er mer en 3 tegn
    if (this.value.length < 3) {
        alert("Poststed må inneholde minst 3 tegn.");
        this.value = activeSupplier.poststed || "";
        return;
    }   

    // Lagre innholdet i databasen
    saveSupplierInfo(activeCustomer.airtable, {poststed: this.value});

    // Lagre innholdet lokalt
    activeCustomer.poststed = this.value;
});


document.getElementById("uploadLogoButton").addEventListener("click", function(event) {
    event.preventDefault(); 

    const widget = uploadcare.Widget("#logoUploadcareWidget");
    widget.openDialog().done(function(file) {
        file.done(function(info) {
            const optimizedImageURL = info.cdnUrl + "-/format/auto/-/quality/smart/";
            console.log("Optimalisert bilde URL:", optimizedImageURL);
            document.getElementById("logoImageCustomer").src = optimizedImageURL;
            document.getElementById("saveLogoButton").classList.add("active");
        });
    });
});

document.getElementById("saveLogoButton").addEventListener("click", function() {
    const imageElement = document.getElementById("logoImageCustomer");
    const imageURL = imageElement.src;  // Hent URL-en til bildet    
    
    // Lagre logo i databasen
    saveSupplierInfo(activeCustomer.airtable, {logourl: imageURL});   

    // Lagre logo lokalt
    activeCustomer.logo = imageURL;
    
    // Deaktiver lagreknappen
    this.classList.remove("active");
});

document.getElementById("goToPortal").addEventListener("click", function() {
  //gå til portal med dette selskapet
  //lagre i session storage
  let companyJson = JSON.stringify([activeCustomer]);
  sessionStorage.setItem("representing", companyJson);
  //gå til adressen https://portal.innkjops-gruppen.no/app-portal i samme vindu
    window.location.href = "https://portal.innkjops-gruppen.no/app-portal";

});



document.getElementById("addMoreUser").addEventListener("click", function() {
    // Hvise loading spinner
    document.getElementById("userloadingscreen").style.display = "block";

    // Hente brukerdata fra Airtable
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC","rec09B6SVzHVF3y0b","userResponse","skipCache");

 
});

function userResponse(data){
    // Skjule loading spinner
    document.getElementById("userloadingscreen").style.display = "none";
    document.getElementById("addMoreUser").style.display = "none";

    // Sjekk om data.fields.membersjson eksisterer og er en array
    if (!data || !data.fields || !data.fields.userjson || !Array.isArray(data.fields.userjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields.userjson' som en array.");
        return;
    }

    // Konverter JSON-strenger til objekter
    const jsonStrings = data.fields.userjson;
    const users = convertUserJsonStringsToObjects(jsonStrings);
    gUsers = users;

    const newUserConteiner = document.getElementById("newUserConteiner");
    newUserConteiner.style.display = "block";

}

function convertUserJsonStringsToObjects(jsonStrings) {
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

   
const inputField = document.getElementById("inputUserSearch");
const dropdown = document.getElementById("dropdown");

inputField.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    dropdown.innerHTML = "";

    if (query.length === 0) {
        dropdown.style.display = "none";
        return;
    }

    // Filtrer brukere basert på 'navn' eller 'epost'
    const filteredUsers = gUsers.filter(user => 
        user.navn.toLowerCase().includes(query) || 
        user.epost.toLowerCase().includes(query)
    );

    if (filteredUsers.length === 0) {
        dropdown.style.display = "none";
        return;
    }

    dropdown.style.display = "block";

    // Generer dropdown-elementer
    filteredUsers.forEach(user => {
        const div = document.createElement("div");
        div.classList.add("dropdown-item");

        div.innerHTML = `
            <span class="user-name">${user.navn}</span>
            <span class="user-email">${user.epost}</span>
        `;

        div.addEventListener("click", function () {
            selectUser(user);
        });

        dropdown.appendChild(div);
    });
});

function selectUser(user) {
    inputField.value = user.navn;
    dropdown.style.display = "none";

    //Sjekke om brukeren allerede er lagt til
    const existingUser = activeCustomer.bruker.find(existingUser => existingUser.epost === user.epost);
    if (existingUser) {
        alert("Denne brukeren er allerede lagt til.");
        return;
    }
    // Legg til brukeren i kundens brukerliste
    activeCustomer.bruker.push(user);

    // Lagre endringene i databasen
    const updatedUsersAirtable = activeCustomer.bruker.map(user => user.airtable);
    saveSupplierInfo(activeCustomer.airtable, {bruker: updatedUsersAirtable});

    // Oppdater brukerlisten
    listUsersOnCustomer(activeCustomer);
}

// Skjul dropdown hvis man klikker utenfor
document.addEventListener("click", function (event) {
    if (!inputField.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.style.display = "none";
    }
});


document.getElementById("customerGroupSelector").addEventListener("change", function() {    
  //lagre gruppe i databasen
    saveSupplierInfo(activeCustomer.airtable, {gruppe: [this.value]});

    // Lagre gruppe lokalt  
    activeCustomer.group = this.value;
});


function saveSupplierInfo(itemId, body) {

    patchAirtable("app1WzN1IxEnVu3m0","tblFySDb9qVeVVY5c",itemId,JSON.stringify(body),"responseSupplierDataUpdate");

}

function responseSupplierDataUpdate(data){
    console.log(data);
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

document.getElementById("getconnectionsButton").addEventListener("click", function() { 
    getconnections(activeCustomer.airtable);
    document.getElementById("connectingList").style.display = "block";

});

function getconnections(customerid){
   let body = airtablebodylistAND({firmaid:customerid});
    Getlistairtable("app1WzN1IxEnVu3m0","tblLjCOdb9elLmKOb",body,"respondconnections");
}

function respondconnections(data){

    var cleandata = rawdatacleaner(data);
    // Fjern selskaper uten navn
    const cleanedList = cleandata.filter(company => 
        company.company && company.company.length > 0
    );
    gConnection = cleanedList;
      
    startConnectionList(cleanedList);

    document.getElementById("addconnectionsButton").style.display = "inline-block";
    document.getElementById("getconnectionsButton").style.display = "none";
}

function startConnectionList(data) {

    //sjekke at det er data
    if (!data || data.length === 0) {
        resetConnectionList();
        //se det i en alert
        alert("Ingen tilkoblede selskaper funnet.");
        return;
    }


    const list = document.getElementById("connectingList");
    if (!list) {
        console.error("List holder element not found");
        return;
    }

    list.replaceChildren(); // Rens listen før ny data legges til

    const elementLibrary = document.getElementById("elementlibrarywrapper");
    if (!elementLibrary) {
        console.error("Element library not found");
        return;
    }

    const nodeElement = elementLibrary.querySelector('.connecting');
    if (!nodeElement) {
        console.error("Template element not found");
        return;
    }

    // Bruk et sett for å lagre unike kombinasjoner av company[0] + supplier[0]
    const uniqueConnections = new Set();
    let filteredData = [];
    /*
    // Fjern duplikater
    data.forEach(connection => {
        const companyId = connection.company?.[0] || "";
        const supplierId = connection.supplier?.[0] || "";
        const uniqueKey = `${companyId}-${supplierId}`;

        if (!uniqueConnections.has(uniqueKey)) {
            uniqueConnections.add(uniqueKey);
            filteredData.push(connection);
        }
    });
    */

    filteredData = data.sort((a, b) => 
        (a.suppliername?.[0] || "").localeCompare(b.suppliername?.[0] || "", 'no', { sensitivity: 'base' })
    );
    

    GlobalConnections = filteredData;
    // Populer listen med unike data
    filteredData.forEach((connection, index) => {
        const rowElement = nodeElement.cloneNode(true);

        // Legg til klasse for annenhver rad (alternating styles)
        if (index % 2 === 1) {
            rowElement.classList.add("pair");
        }

        // Populer raden med data
        rowElement.querySelector(".date").textContent = formatDate(connection.lastmodified) || "Ingen dato";
        rowElement.querySelector(".supplier").textContent = connection.suppliername?.[0] || "";
        rowElement.querySelector(".person").textContent = connection.brukernavn?.[0] || "";

        const removeButton = rowElement.querySelector(".removebutton");
        removeButton.addEventListener("click", function() {
            removeConnection(connection, rowElement);
        });

        // Legg til rad i listen
        list.appendChild(rowElement);
    });

     // Oppdater telleren for antall tilkoblede selskaper
     document.getElementById("connectioncounter").textContent = document.getElementById("connectingList").childElementCount + " stk. tilkoblede selskaper.";
}

function removeConnection(connection, rowElement) {
    // Spør brukeren om de er sikre på at de vil fjerne tilkoblingen
    let suppliername = connection.suppliername?.[0] || "Ukjent leverandør";
    if (!confirm(`Er du sikker på at du vil fjerne tilkoblingen til ${suppliername}?`)) {
        return;
    }

    // Fjern tilkoblingen fra databasen
    DELETEairtable("app1WzN1IxEnVu3m0","tblLjCOdb9elLmKOb",connection.airtable,"responseDeleteConnection");
    // Fjern raden fra listen
    rowElement.remove();

    // Oppdater telleren for antall tilkoblede selskaper
    document.getElementById("connectioncounter").textContent = document.getElementById("connectingList").childElementCount + " stk. tilkoblede selskaper.";

}

function responseDeleteConnection(data){
    console.log(data);
}

function resetConnectionList() {
    document.getElementById("connectingList").replaceChildren();
    document.getElementById("connectioncounter").textContent = "0 stk. tilkoblede selskaper.";
}

document.getElementById("addconnectionsButton").addEventListener("click", function() {  
    //
     // Hvise loading spinner
     document.getElementById("connectionloadingscreen").style.display = "block";

     // Hente Alle leverandører fra Airtable
     GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC","recwnwSGJ0GvRwKFU","supplierResponse","skipCache");

});

function supplierResponse(data){
    // Skjule loading spinner
    document.getElementById("connectionloadingscreen").style.display = "none";
    document.getElementById("addconnectionsButton").style.display = "none";

    // Sjekk om data.fields.membersjson eksisterer og er en array
    if (!data || !data.fields || !data.fields.supplierjson || !Array.isArray(data.fields.supplierjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields.userjson' som en array.");
        return;
    }

    // Konverter JSON-strenger til objekter
    const jsonStrings = data.fields.supplierjson;
    const suppliers = convertSuppliersJsonStringsToObjects(jsonStrings);
    gSuppliers = suppliers;
  

    const newUserConteiner = document.getElementById("newConnectionConteiner");
    newUserConteiner.style.display = "block";

}

function convertSuppliersJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
        try {
            // Midlertidig fjern `info`-feltet hvis det finnes
            let infoValue = '';
            if (jsonString.includes('"info":')) {
                // Ekstraher `info`-feltet med en regex (forutsatt korrekt JSON-format)
                const infoMatch = jsonString.match(/"info":\s*"(.*?)"(,|\})/s);
                if (infoMatch) {
                    infoValue = infoMatch[1];  // Ekstraher verdien av `info`
                    jsonString = jsonString.replace(/"info":\s*".*?"(,|\})/s, '"info":""$1');  // Fjern HTML-innholdet midlertidig
                }
            }

            let shortinfoValue = '';
            if (jsonString.includes('"kortinfo":')) {
                // Ekstraher `info`-feltet med en regex (forutsatt korrekt JSON-format)
                const shortinfoMatch = jsonString.match(/"kortinfo":\s*"(.*?)"(,|\})/s);
                if (shortinfoMatch) {
                    shortinfoValue = shortinfoMatch[1];  // Ekstraher verdien av `info`
                    jsonString = jsonString.replace(/"kortinfo":\s*".*?"(,|\})/s, '"kortinfo":""$1');  // Fjern HTML-innholdet midlertidig
                }
            }


            // Parse JSON-strengen uten HTML-dataen
            const data = JSON.parse(jsonString);

            // Legg tilbake `info`-feltet
            data.info = infoValue;
            data.kortinfo = shortinfoValue;

            // Sørg for at "group" og "category" alltid er arrays
            if (!data.group) {
                data.group = [];
            }
            if (!data.category) {
                data.category = [];
            }

            if (!data.attachment) {
                data.attachment = [];
            }

            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}

  
const inputFieldc = document.getElementById("inputConnectionSearch");
const dropdownc = document.getElementById("dropdownConnection");

inputFieldc.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    dropdownc.innerHTML = "";

    if (query.length === 0) {
        dropdownc.style.display = "none";
        return;
    }

    // Filtrer brukere basert på 'navn' eller 'epost'
    const filteredSupplier = gSuppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(query)
    );

    if (filteredSupplier.length === 0) {
        dropdownc.style.display = "none";
        return;
    }

    dropdownc.style.display = "block";

    // Generer dropdown-elementer
    filteredSupplier.forEach(supplier => {
        const div = document.createElement("div");
        div.classList.add("dropdown-item");

        div.innerHTML = `
            <span class="user-name">${supplier.name}</span>
        `;

        div.addEventListener("click", function () {
            selectSupplier(supplier);
        });

        dropdownc.appendChild(div);
    });
});

function selectSupplier(supplier) {
    inputFieldc.value = supplier.name;
    dropdownc.style.display = "none";

    //opprett en ny tilkobling i databasen
    let body = {company:[activeCustomer.airtable],supplier:[supplier.airtable],bruker:[userid]};
    POSTNewRowairtable("app1WzN1IxEnVu3m0","tblLjCOdb9elLmKOb",JSON.stringify(body),"responseNewConnection");

}

function responseNewConnection(data){

     //oppdater tilkoblingslisten
    gConnection.push(data.fields);
    startConnectionList(gConnection);   
    console.log(data);
}

// Skjul dropdown hvis man klikker utenfor
document.addEventListener("click", function (event) {
    if (!inputFieldc.contains(event.target) && !dropdownc.contains(event.target)) {
        dropdownc.style.display = "none";
    }
});

function setupHovedselskapSearch(companyList, onCompanySelected) {
    const input = document.getElementById("hovedselskapinput");
    const suggestionBox = document.getElementById("hovedselskap-suggestions");
    parentCompany = {};

    input.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase().trim();
        suggestionBox.innerHTML = "";
        parentCompany = {};

        //save den hvis den er tom
        if (searchTerm.length === 0) {
            suggestionBox.style.display = "none";
            onHovedselskapSelected("", "")
            return;
        }


        if (searchTerm.length === 0) {
            suggestionBox.style.display = "none";
            return;
        }

        const matches = companyList.filter(company =>
            company.Name && company.Name.toLowerCase().includes(searchTerm)
        );

        if (matches.length === 0) {
            suggestionBox.style.display = "none";
            return;
        }

        matches.slice(0, 10).forEach(company => {
            const option = document.createElement("div");
            option.innerText = company.Name;
            option.addEventListener("click", () => {
                input.value = company.Name;
                suggestionBox.style.display = "none";

                // Kall funksjonen med både navn og Airtable-ID
                if (typeof onCompanySelected === "function") {
                    onCompanySelected(company.Name, company.airtable);
                }
            });
            suggestionBox.appendChild(option);
        });

        suggestionBox.style.display = "block";
    });

    document.addEventListener("click", function (event) {
        if (!input.contains(event.target) && !suggestionBox.contains(event.target)) {
            suggestionBox.style.display = "none";
        }
    });
}

function onHovedselskapSelected(navn, airtableId) {

     //lagre gruppe i databasen
     let body = {};
     if (airtableId === "") {
        body = {parentcompany:[]};
    }else{
        const parentCompany = document.getElementById("hovedselskapinput");
        parentCompany.value = navn || "";
        parentCompany.dataset.airtable = airtableId || "";
        body = {parentcompany:[airtableId]};
    }

    saveSupplierInfo(activeCustomer.airtable, body);

}

function formatNameList(nameList) {
    if (Array.isArray(nameList)) {
        // Hvis det er en array, returner det første elementet med "..."
        return `${nameList[0].trim()}...`;
    } else if (typeof nameList === "string") {
        // Hvis det er en streng, splitt den på komma
        const names = nameList.split(',');
        return `${names[0].trim()} ...`;
    } else {
        console.error("Expected a string or array, but got:", nameList);
        return "Ukjent...";
    }
}

function formatDate(inputDate) {
    const months = [
        "jan", "feb", "mar", "apr", "mai", "jun",
        "jul", "aug", "sep", "okt", "nov", "des"
    ];

    const date = new Date(inputDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}.${month} ${year}`;
}

document.getElementById("xlsexportbutton").addEventListener("click", () => {
    // Feltene du vil hente
    const selectedFields = ["lastmodified", "companyorgnr", "companyname", "useremail", "companybrukernavn","companyuseremail"];

    // Mapping til nye navn
    const fieldMapping = {
        lastmodified: "Dato",
        companyorgnr: "Orgnummer",
        companyname: "Selskapsnavn",
        useremail: "Innsender",
        companybrukernavn: "Brukere",
        companyuseremail: "Bruker e-poster"
    };

    let filename = "Tilkoblinger for " + GlobalConnections[0].suppliername[0];

    // Eksporter til Excel
    exportData(GlobalConnections, selectedFields, fieldMapping, filename);
});
var activeInvitation = {};

document.getElementById("invitemembersbutton").addEventListener("click", function() {
   
    const invitationwrapper = document.getElementById("invitationwrapper");

    // Sjekk om elementet er synlig
    if (invitationwrapper.classList.contains("visible")) {
        // Skjul elementet
        invitationwrapper.style.height = `${invitationwrapper.scrollHeight}px`; // Sett høyden til nåværende høyde
        requestAnimationFrame(() => {
            invitationwrapper.style.transition = "height 0.5s ease";
            invitationwrapper.style.height = "0px";
        });

        // Fjern synlighet etter animasjonen
        setTimeout(() => {
            invitationwrapper.classList.remove("visible");
            invitationwrapper.style.display = "none";
        }, 500);
    } else {
        // Vis elementet
        invitationwrapper.style.display = "block";
        invitationwrapper.style.height = "0px";

        requestAnimationFrame(() => {
            invitationwrapper.classList.add("visible");
            invitationwrapper.style.transition = "height 0.5s ease";
            invitationwrapper.style.height = `${invitationwrapper.scrollHeight}px`;
        });

        // Fjern høyde etter animasjon for å unngå problemer ved resizing
        setTimeout(() => {
            invitationwrapper.style.height = "auto";
        }, 500);
    }
});

function companyPageChosed(company) {
   
    // Simulerer klikk på elementet
    document.getElementById("tabcompany").click();

    const conteinerpage = document.getElementById("companyconteinerpage");

    // Sett logo
      const logo = conteinerpage.querySelector('.subpagelogo');
      if (logo) {
          if (company.logo) {
              logo.src = company.logo;
              logo.style.display = "inline-block";
          } else {
            logo.style.display = "none";
          }
    }
    
    // Oppdaterer data på selskapet
    let name = conteinerpage.querySelector('.companyname');
    name.textContent = company.Name || "-";

    let orgnr = conteinerpage.querySelector('.orgnr');
    orgnr.textContent = company.orgnr || "-";

    let groupname = conteinerpage.querySelector('.group');
    groupname.textContent = company.groupname || "-";

    let adress = conteinerpage.querySelector('.adress');
    adress.textContent = company.adresse || "-";

    let post = conteinerpage.querySelector('.post');
    adress.textContent = company.postnr+" "+company.poststed;

    preLists(company);
}

function preLists(company){

let users = company.bruker;
// Sorter brukere alfabetisk basert på 'name', med fallback for manglende navn
users.sort((a, b) => (a.name || "").localeCompare(b.name || ""));   

//liste alle hovedbrukere
const list = document.getElementById("memberholderlist");
listCompanyUsers(users.filter(user => user.rolle !== "ansatt"),list,company);

const listpri = document.getElementById("memberpriholderlist");
listCompanyUsers(users.filter(user => user.rolle == "ansatt"),listpri,company);

}

function listCompanyUsers(users,list,company){
 
    if (!list) {
        console.error("Ingen 'elementlibrary' funnet.");
        return;
    }
    list.innerHTML = '';
    
    const elementLibrary = document.getElementById("elementlibrary");
    if (!elementLibrary) {
        console.error("Ingen 'elementlibrary' funnet.");
        return;
    }

    const nodeElement = elementLibrary.querySelector(".membercardwrapper");
    if (!nodeElement) {
        console.error("Ingen '.suppliercard' funnet i 'elementlibrary'.");
        return;
    }

    users.forEach(member => {
      const memberElement = nodeElement.cloneNode(true);

      let name = memberElement.querySelector('.name');
      name.textContent = member.navn || "-";

      let email = memberElement.querySelector('.email');
      email.textContent = member.epost || "-";

        let roll = memberElement.querySelector('.roll');
        let rollSelector = memberElement.querySelector('.rollSelector');

        if (userObject?.rolle === "Admin") {
            // Finn og sett riktig alternativ som aktiv i rollSelector
            const options = rollSelector.querySelectorAll('option');
            options.forEach(option => {
                if (option.value === member.rolle) {
                    option.selected = true;  // Sett alternativet som valgt
                }
            });

            // Legg til en 'change'-hendelse på rollSelector
            rollSelector.addEventListener('change', () => {
                rollSelectorChange(rollSelector,member,company);  // Kjør funksjonen når verdien endres
            });

            roll.style.display = "none";  // Skjul roll-elementet
        } else {
            // Sett rolle som tekst hvis det ikke er "Admin"
            roll.textContent = member?.rolle || "-";
            rollSelector.style.display = "none";  // Skjul rollSelector-elementet
        }

      list.appendChild(memberElement);

    });

}

function rollSelectorChange(selector, member, company) {
    // Hent valgt alternativs tekst fra selector
    const selectedText = selector.options[selector.selectedIndex].text;

    if(selector.value == "remove"){
        const confirmMessage = `Er du sikker på at du vil fjerne brukeren ${member.navn}\nfra ${company.Name}?`;

        if (confirm(confirmMessage)) {
            console.log("Ja, fjern denne brukeren");
        
            // Finn og fjern brukeren basert på airtable-nøkkelen
            company.bruker = company.bruker.filter(user => user.airtable !== member.airtable);
        
            // Lag en array med de gjenværende brukernes ID
            const remainingUserIds = company.bruker.map(user => user.airtable);
        
            // Opprett body for oppdatering
            let body = { bruker: remainingUserIds };
        
            // Oppdater serveren med de gjenværende brukerne
            PATCHairtable(
                "app1WzN1IxEnVu3m0",
                "tblFySDb9qVeVVY5c",
                company.airtable,
                JSON.stringify(body),
                "responsrollChange"
            );
            preLists(company);
            
        } else {
            console.log("Nei, avbryt fjerning av denne brukeren");
            selector.value = member.rolle;  // Sett tilbake forrige verdi i selector
        }

    }else{
       

        // Vis en bekreftelsesmelding
        const confirmMessage = `Bytte tilgang for ${member.navn}\nFra ${member.rolle} til ${selectedText} ?`;

        if (confirm(confirmMessage)) {
            console.log("Tilgang oppdatert for:", member);

            // Opprett body for oppdatering
            let body = { rolle: selector.value };

            // Oppdater server
            PATCHairtable(
                "app1WzN1IxEnVu3m0",
                "tblMhgrvy31ihKYbr",
                member.airtable,
                JSON.stringify(body),
                "responsrollChange"
            );

            // Oppdater verdi i company.bruker-arrayen
            let userToUpdate = company.bruker.find(u => u.airtable === member.airtable);
            if (userToUpdate) {
                userToUpdate.rolle = selector.value;
                preLists(company);


            } else {
                console.warn("Bruker ikke funnet i company.bruker-arrayen");
            }
        } else {
            // Sett tilbake forrige verdi hvis bekreftelsen avbrytes
            selector.value = member.rolle;
        }
    }
}

function responsrollChange(data){
console.log(data);
}

document.getElementById("searshforemailbutton").addEventListener("click", function() {
    //søk etter brukere med denne eposten
    const epostfield = document.getElementById("emailinvitationfield");
    let body = airtablebodylistAND({epost:epostfield.value});
    Getlistairtable("app1WzN1IxEnVu3m0","tblMhgrvy31ihKYbr",body,"responsEmailsearchServer");
    document.getElementById("loadingscreenepostsearch").style.display = "block";
});
    
function responsEmailsearchServer(data) {
    document.getElementById("loadingscreenepostsearch").style.display = "none";

    console.log("Har funnet dette", data);

    // Rens data og lagre i 'response'
    let response = rawdatacleaner(data);

    if (response.length > 0) {
        // Det er gjort funn på en bruker med denne e-posten
        let user = response[0];

        // Vis bekreftelsesmelding
        const confirmMessage = `Det finnes en bruker med denne e-posten!\nØnsker du å invitere brukeren med navn "${user.navn}" og e-post "${user.epost}" til dette selskapet?`;

        if (confirm(confirmMessage)) {
            console.log("Bruker skal inviteres:", user);
            // Her kan du legge til logikk for å invitere brukeren
            //lag en invitasjon for denne brukeren
            
        } else {
            console.log("Brukeren ble ikke invitert.");
        }
    } else {
        // Ingen bruker funnet, vis inputfeltene for navn og telefonnummer
        newinvitatioUser(email);
       // document.getElementById("nameInputField").style.display = "block";
        //document.getElementById("phoneInputField").style.display = "block";
    }
}


function newinvitatioUser(user){
    const epostfield = document.getElementById("emailinvitationfield");
    const epostTextLable = document.getElementById("epostresponse");
    epostTextLable.textContent = epostfield.value;
    document.getElementById("newuserinvitation").style.display = "flex";
}


document.getElementById("sendinvitationbutton").addEventListener("click", function() {
    // Hent inputelementene
    const emailElement = document.getElementById("epostresponse");
    const nameElement = document.getElementById("nameinputinvitation");
    const phoneElement = document.getElementById("phoneinputinvitation");
    const roleSelector = document.getElementById("invitationrolle");

    // Hent verdier fra feltene
    const email = emailElement.textContent.trim();
    const name = nameElement.value.trim();
    const phone = phoneElement.value.trim();
    const role = roleSelector.value;

    // Valider e-post
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Valider navn (må ha minst 2 tegn)
    const nameIsValid = name.length >= 2;

    // Valider telefonnummer (kun tall og minst 8 sifre)
    const phoneIsValid = /^[0-9]{8,15}$/.test(phone);

    // Valider rolle (må ha en gyldig verdi)
    const roleIsValid = role !== "";

    // Sjekk om alle feltene er korrekt fylt ut
    if (!emailIsValid) {
        alert("Vennligst fyll inn en gyldig e-postadresse.");
        return;
    }

    if (!nameIsValid) {
        alert("Vennligst fyll inn et gyldig navn (minst 2 tegn).");
        return;
    }

    if (!phoneIsValid) {
        alert("Vennligst fyll inn et gyldig telefonnummer (kun tall, minst 8 sifre).");
        return;
    }

    if (!roleIsValid) {
        alert("Vennligst velg en rolle.");
        return;
    }

    // Hvis alt er korrekt, kjør funksjonen med informasjonen
    inviteUser({ email, name, phone, role });
});

// Eksempel på funksjon som kjøres hvis alt er korrekt
function inviteUser(userInfo) {
    console.log("Inviterer bruker:", userInfo);

    let body = {navn:userInfo.name,epost:userInfo.email,telefon:userInfo.phone,rolle:userInfo.role,firma:[activeCompany.airtable],avsender:[userObject.airtable]};
    POSTNewRowairtable("app1WzN1IxEnVu3m0","tblc1AGhwc6MMu4Aw",JSON.stringify(body),"responseInvitationSendt")

    document.getElementById("loadingscreenepostsearch").style.display = "block";

}


function responseInvitationSendt(data) {
    console.log(data);

    // Skjul loading-skjermen
    document.getElementById("loadingscreenepostsearch").style.display = "none";

    // Generer en sharelink
    let baseId = "app1WzN1IxEnVu3m0";
    let tableId = "tblc1AGhwc6MMu4Aw";
    let rowId = data.id;
    let text = "Invitasjonslink";

    // Beregn utløpsdatoen 3 måneder frem i tid
    let expirationdate = new Date();
    expirationdate.setMonth(expirationdate.getMonth() + 3);

    // Formatér datoen til "YYYY-MM-DD"
    let expirationdateFormatted = expirationdate.toISOString().split('T')[0];

    // Generer offentlig lenke
    generatePublicLink({ baseId, tableId, rowId, text, expirationdate: expirationdateFormatted });
}



function generatePublicLink(data) {
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
    POSTairtablepublicLink(JSON.stringify(body), "responPostpublicLink");
}

function responPostpublicLink(data){
 
    // Sett href-attributtet til ønsket URL
    let link = "https://portal.innkjops-gruppen.no/app-portal?"+"shareKey="+data.shareKey+"&shareId="+data.shareId;
    console.log(link);
    //send denne linken på mail til 
}

function startUserInvitationView(data){

    activeInvitation = data;
    //klikk på invitasjonssiden
    document.getElementById("userinvitationtabbutton").click();
    
    const invitationuserwrapper = document.getElementById("invitationuserwrapper");

    // Hent elementene og oppdater dem kun hvis de finnes
    const nameText = invitationuserwrapper.querySelector(".namelabel");
    if (nameText) nameText.textContent = `Hei ${data.navn}.`;

    const infotextLabel = invitationuserwrapper.querySelector(".infotextlable");
    if (infotextLabel) infotextLabel.textContent = `Du er invitert til å administrere selskapet ${data.firmanavn} i leverandørportalen.`;

    const emailLabel = invitationuserwrapper.querySelector(".emaillable");
    if (emailLabel) emailLabel.textContent = data.epost;

}

function validatePasswords() {
    const password1 = document.getElementById("passwordinput1").value;
    const password2 = document.getElementById("passwordinput2").value;
    const errorText = document.getElementById("passwordError");
    const submitButton = document.getElementById("acseptinvitationbutton");

    if (password1.length < 4 || password2.length < 4) {
        errorText.style.display = "none";
        submitButton.style.display = "none"; // Skjuler knappen til passordene er validert
        return;
    }

    if (password1 !== password2) {
        errorText.style.display = "block";
        submitButton.style.display = "none"; // Skjuler knappen hvis passordene ikke samsvarer
    } else {
        errorText.style.display = "none";
        submitButton.style.display = "inline-block"; // Viser knappen når passordene er like
    }
}


document.getElementById("acseptinvitationbutton").addEventListener("click", function() {

    //sende inn data for å opprette bruker
    let password = document.getElementById("passwordinput2").value;
    let name = activeInvitation.navn;
    let email = activeInvitation.epost;
    let companyId = activeInvitation.firma;
    let phone = activeInvitation.telefon;
    let role = activeInvitation.rolle;

    let body = {epost:email,telefon:phone,navn:name,company:[companyId],rolle:role};
    //opprett bruker i database
    sendUserToZapier(body);

    //hvis animasjon
    document.getElementById("loadingscreenepostsearch").style.display = "block";
});

async function sendUserToZapier(data) {
    

    const formData = new FormData();
    for (const key in data) {
        const value = data[key];
        // Sjekk om verdien er en array eller objekt og stringify hvis nødvendig
        formData.append(key, Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : value);
    }

    const response = await fetch("https://hooks.zapier.com/hooks/catch/10455257/2ajscws/", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        document.getElementById("loadingscreenepostsearch").style.display = "none";
    } else {
        console.error("Error sending data to Zapier:", response.statusText);
    }
}
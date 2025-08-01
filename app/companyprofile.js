var activeInvitation = {};
var userInfoMail = {};

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
    post.textContent = company.postnr+" "+company.poststed;

    preLists(company);

    employeebenefits(company);
}

function preLists(company){

    let users = company.bruker;
    // Sorter brukere alfabetisk basert på 'name', med fallback for manglende navn
    users.sort((a, b) => (a.name || "").localeCompare(b.name || ""));   

    //liste alle hovedbrukere
    const list = document.getElementById("memberholderlist");
    listCompanyUsers(users.filter(user => user.rolle !== "ansatt"),list,company);

    const listpri = document.getElementById("memberpriholderlist");
    let ansattarray = users.filter(user => user.rolle == "ansatt");
    if(ansattarray.length >0){
        listCompanyUsers(ansattarray,listpri,company);
    }else{
        document.getElementById("ansattbrukereliste").style.display = "none";
    }


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
    
    const epostField = document.getElementById("emailinvitationfield");
    const epostValue = epostField.value.trim(); // Fjerner eventuelle mellomrom

    // Sjekk først om denne brukeren allerede er i selskapet
    let users = activeCompany.bruker || []; // Sikrer at det ikke krasjer hvis 'bruker' ikke er definert
    
    // Bruker "some()" for å sjekke om epost allerede finnes i users-arrayen
    let userExists = users.some(user => user.epost === epostValue);

    if (userExists) {
        alert("Denne brukeren er allerede lagt til i dette selskapet.");
        return; // Stopper funksjonen hvis brukeren finnes
    }

    // Søk etter brukere med denne e-posten på serveren
    let body = airtablebodylistAND({ epost: epostValue });
    Getlistairtable("app1WzN1IxEnVu3m0", "tblMhgrvy31ihKYbr", body, "responsEmailsearchServer");

    // Viser en loading-indikator mens søket pågår
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
            inviteExistingUser(user)
            
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

function inviteExistingUser(user) {
    userInfoMail = user;
    let body = {bruker:[user.airtable],navn:user.navn,epost:user.epost,telefon:user.telefon,firma:[activeCompany.airtable],avsender:[userObject.airtable]};
    POSTNewRowairtable("app1WzN1IxEnVu3m0","tblc1AGhwc6MMu4Aw",JSON.stringify(body),"responseInvitationSendt")
    document.getElementById("loadingscreenepostsearch").style.display = "block";
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

function inviteUser(userInfo) {
    console.log("Inviterer bruker:", userInfo);
    userInfoMail = userInfo;
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
    //send denne linken på mail via zapier

    let mailData = {};
    if(userInfoMail?.airtable){
        //dette er en eksisterende bruker som er invitert
        mailData = {
            name:userInfoMail.navn,
            mail:userInfoMail.epost,
            phone:userInfoMail.telefon,
            companyname:activeCompany.Name,
            link:link,
            sendername:userObject.navn,
            exist:true,
            groupemail:activeCompany.groupemail || ""
        };

    }else{
        mailData = {
                name:userInfoMail.name,
                mail:userInfoMail.email,
                phone:userInfoMail.phone,
                role:userInfoMail.role,
                companyname:activeCompany.Name,
                link:link,
                sendername:userObject.navn,
                exist:false,
                groupemail:activeCompany.groupemail || ""
        };
    }

    sendMail(mailData);
}

async function sendMail(data) {
    
    const formData = new FormData();
    for (const key in data) {
        const value = data[key];
        // Sjekk om verdien er en array eller objekt og stringify hvis nødvendig
        formData.append(key, Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : value);
    }

    const response = await fetch("https://hooks.zapier.com/hooks/catch/10455257/2avamvd/", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
      //da er mailen sendt til mottaker
    document.getElementById("newuserinvitation").style.display = "none";
    document.getElementById("sentdinvitationwrapper").style.display = "block";
    setTimeout(() => {
        document.getElementById("sentdinvitationwrapper").style.display = "none";
        //tøm feltet
        document.getElementById("emailinvitationfield").value = "";
        //animer skjul
        document.getElementById("invitemembersbutton").click();
    }, 3000);
    
    } else {
        console.error("Error sending data to Zapier:", response.statusText);
    }
}

function startUserInvitationView(data){

    activeInvitation = data;
    //klikk på invitasjonssiden
    document.getElementById("userinvitationtabbutton").click();
    const contentview = document.getElementById("presenderusercreate");
    const acseptedwrapper = document.getElementById("acseptedwrapper");
    const uapwrapper = document.getElementById("usernameandpasswordwrapper");
    const acseptbutton = document.getElementById("acseptinvitationbutton");

    let textContent = `Du er invitert til å administrere selskapet ${data.firmanavn} i leverandørportalen.`;
        if(data?.rolle == "ansatt"){
            textContent = `Du er invitert til leverandørportalen.`;
        }

    
    if(data?.akseptert){
        contentview.style.display = "none";
        acseptedwrapper.style.display = "block";
        setTimeout(() => {
            window.location.href = "https://portal.innkjops-gruppen.no/app-portal";
        }, 3000);

    }else if(data?.bruker){
        //dette er en eksisterende bruker og vindu for passord skal ikke vises

        // Hent elementene og oppdater dem kun hvis de finnes
        const nameText = invitationuserwrapper.querySelector(".namelabel");
        if (nameText) nameText.textContent = `Hei ${data.navn}.`;

        

        const infotextLabel = invitationuserwrapper.querySelector(".infotextlable");
        if (infotextLabel) infotextLabel.textContent = textContent;
        acseptbutton.style.display = "lnline-block";
        uapwrapper.style.display = "none";
        acseptbutton.addEventListener("click", function() {
            acseptInvitationExistUser(data);
        });

    }else{
        uapwrapper.style.display = "block";
        contentview.style.display = "block";
        acseptedwrapper.display = "none";

        const invitationuserwrapper = document.getElementById("invitationuserwrapper");

        // Hent elementene og oppdater dem kun hvis de finnes
        const nameText = invitationuserwrapper.querySelector(".namelabel");
        if (nameText) nameText.textContent = `Hei ${data.navn}.`;

        const infotextLabel = invitationuserwrapper.querySelector(".infotextlable");
        if (infotextLabel) infotextLabel.textContent = textContent;

        const emailLabel = invitationuserwrapper.querySelector(".emaillable");
        if (emailLabel) emailLabel.textContent = data.epost;

        const TermsofServiceSelector = document.getElementById("termsofservicelink");
        const termsofservice = document.getElementById("termsofservice");

            if (data?.rolle == "ansatt") {
                termsofservice.style.display = "none";
            }else{
                termsofservice.style.display = "inline-block";
                //hvis vilkår er tilgjengelig sett den til href
                if (data?.vilkarurl) {
                    TermsofServiceSelector.href = data.vilkarurl;
                } else {
                    //sett den til standard
                    TermsofServiceSelector.href = "https://ucarecdn.com/9d6eda35-4a29-4d61-99d6-840f9cb6309c/VilkarIG100425std.pdf";
                }
            }
        

        acseptbutton.addEventListener("click", function() {
            acseptInvitationNewUser();
        });
    }

}

function validatePasswords() {
    const password1 = document.getElementById("passwordinput1").value;
    const password2 = document.getElementById("passwordinput2").value;
    const errorText = document.getElementById("passwordError");
    const submitButton = document.getElementById("acseptinvitationbutton");

    // Nullstill feilmelding og skjul knappen
    errorText.style.display = "none";
    submitButton.style.display = "none";

    // Sjekk lengdekravet KUN for password1
    if (password1.length < 8) {
        errorText.textContent = "Passordet må være minst 8 tegn langt.";
        errorText.style.display = "block";
        return;
    }

    // Sjekk om passordene samsvarer, men først etter at password1 er valid
    if (password2.length > 0 && password1 !== password2) {
        errorText.textContent = "Passordene samsvarer ikke.";
        errorText.style.display = "block";
        return;
    }

    // Hvis alle krav er oppfylt, vis knappen
    errorText.style.display = "none";
    submitButton.style.display = "inline-block";
}

function acseptInvitationExistUser(data){
//hente ut brukere på selskapet
GETairtable("app1WzN1IxEnVu3m0","tblFySDb9qVeVVY5c",data.firma[0],"acceptInvitationCompanyResponse");
//slå på loading
document.getElementById("loadingscreeninvitation").style.display = "block";

}

function acceptInvitationCompanyResponse(data) {

    let company = data.fields;

    // Legger til brukeren i arrayet
    let userArray = company.bruker || [];

    // Oppdaterer selskapet med den nye brukeren
    userArray.push(activeInvitation.bruker[0]);

    let body = { bruker: userArray };

    // Sender oppdateringen til Airtable
    patchAirtable(
        "app1WzN1IxEnVu3m0",
        "tblFySDb9qVeVVY5c",
        data.id,
        JSON.stringify(body),
        "responseUserInvitationAcceptExist" 
    );
}

function responseUserInvitationAcceptExist(data) {  

    //Oppdater invitasjon til akseptert på ServiceWorkerRegistration
let body = { akseptert: true };

    // Sender oppdateringen til Airtable
    patchAirtable(
        "app1WzN1IxEnVu3m0",
        "tblFySDb9qVeVVY5c",
        activeInvitation.airtable,
        JSON.stringify(body),
        "responseInvitationAccept" 
    );

   
}

function responseInvitationAccept() {
    // Fjerner alle query-parametere fra URL-en
    window.history.replaceState(null, null, window.location.pathname);

    // Laster inn siden på nytt
    location.reload();
}

function acseptInvitationNewUser(){
    // Hent brukerdata
    let password = document.getElementById("passwordinput2").value;
    let name = activeInvitation.navn;
    let email = activeInvitation.epost;
    let companyId = activeInvitation?.firma?.[0] || "";
    let phone = activeInvitation.telefon;
    let role = activeInvitation.rolle;
    let invitationairtable = activeInvitation.airtable;
    let pipedrivedealsid = activeInvitation.pipedrivedealsid || "";
    let gruppepipedrivestageacceptid = activeInvitation.gruppepipedrivestageacceptid || "";
    let gruppemail = activeInvitation.gruppemail || "";

    // Krypter aktiveringskode (e-post + passord)
    let aCode = { email, password };
    let encryptedKey = encryptData(aCode);

    let body = {
        epost: email,
        telefon: phone,
        navn: name,
        company: companyId,
        rolle: role,
        airtable: invitationairtable,
        password: password,
        actCode: encryptedKey,
        pipedrivedealsid: pipedrivedealsid,
        gruppepipedrivestageacceptid: gruppepipedrivestageacceptid,
        gruppemail: gruppemail
    };

    // Send brukerdata til Zapier
    sendUserToZapier(body);

    // Vis lasteskjerm
    document.getElementById("loadingscreeninvitation").style.display = "block";
};

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
        document.getElementById("loadingscreeninvitation").style.display = "none";
        document.getElementById("presenderusercreate").style.display = "none";
        document.getElementById("emailissendtwrapper").style.display = "block";
    } else {
        console.error("Error sending data to Zapier:", response.statusText);
    }
}

function runActivation(data){

    

    //start activeringssiden
    document.getElementById("emailverificatiomtabbutton").click();
    
    let decryptedData = decryptData(data);

    if (!decryptedData) {
        //gå til innloggingsiden
        window.location.href = "https://portal.innkjops-gruppen.no/app-portal";
        return;
    }


    let password = decryptedData.password;
    let email = decryptedData.email;
    document.getElementById("verificationemaillable").textContent = email;

    // 🚀 Fjern 'key' fra URL-en
    removeUrlParameter('key');  
    isSharkey = false;

     //logg inn
    document.getElementById("email").value = email;
    document.getElementById("password").value = password;
    sessionStorage.setItem("rootToApp", "true");

    // ⏳ Forsink innlogging med 3 sekunder (3000 millisekunder)
    setTimeout(() => {
            document.getElementById("logginbutton").click();
    }, 3000);







}

function removeUrlParameter(param) {
    let url = new URL(window.location.href);
    let params = new URLSearchParams(url.search);

    // Fjern parameteren
    params.delete(param);
    // Oppdater URL uten å laste siden på nytt
    window.history.replaceState({}, document.title, url.pathname + '?' + params.toString());
   
}

function employeebenefits(data) {
    // Hent wrapper-elementet for ansattfordeler
    const elementWrapper = document.getElementById("employeebenefits");

    if (data.ansattfordeler) {
        elementWrapper.style.display = "block";

        // Hent eller opprett linken i elementet med id "employerlink"
        const employerLinkContainer = document.getElementById("employerlink");
        employerLinkContainer.innerHTML = ""; // Tøm eksisterende innhold
        const copyButton = document.getElementById("copylinkbutton");

        if (data.ansattfordelerlink) {
            
            let url = "https://portal.innkjops-gruppen.no/app-portal?"+data.ansattfordelerlink;
            const link = document.getElementById("employerlink");
            link.href = url;
            link.textContent = "Invitasjonslink";
            link.target = "_blank";
            link.style.display = "none";

            // Lag kopier-knappen
            copyButton.style.display = "inline-block";
            
            copyButton.onclick = function () {
               //send linken på epost til brukeren
                let mailData = {
                    name:userObject.navn,
                    mail:userObject.epost,
                    phone:userObject.telefon,
                    companyname:activeCompany.Name,
                    link:url,
                    groupemail:activeCompany.groupemail
                };
                sendansattfordelerlink(mailData);
            };
        } else {
            // Generer lenken dersom den ikke finnes
            generateEmployerLink(data);
            document.getElementById("employerlink").style.display = "none";
            copyButton.style.display = "none";
        }
    } else {
        elementWrapper.style.display = "none";
    }
}
async function sendansattfordelerlink(data){
    const formData = new FormData();
    for (const key in data) {
        const value = data[key];
        // Sjekk om verdien er en array eller objekt og stringify hvis nødvendig
        formData.append(key, Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : value);
    }

    const response = await fetch("https://hooks.zapier.com/hooks/catch/10455257/2n1r7zc/", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        //skrive at epost er sendt
        const ansattfordelermailsendt = document.getElementById("ansattfordelermailsendt");
        ansattfordelermailsendt.style.display = "block";
        setTimeout(() => {
            ansattfordelermailsendt.style.display = "none";
        }, 3000);
        ansattfordelermailsendt.textContent = "Epost med invitasjonslink er sendt til "+userObject.epost;

    } else {
        console.error("Error sending data to Zapier:", response.statusText);
    }
 

}

function  generateEmployerLink(data){   

    //lag row for kobling
    console.log("Genererer link");
    let categoryid = "recSbtJnNprzB42fd"

    let body = {
        companyid:[activeCompany.airtable],
        category:[categoryid],
        creator:[userid]
    }

    POSTNewRowairtable("app1WzN1IxEnVu3m0","tblfDzgRjRKBiIxM3",JSON.stringify(body),"responsGenerateLink")
    //slå på loading
    document.getElementById("generatelinkloading").style.display = "block";
}

function responsGenerateLink(data){

    // Generer en sharelink
    let baseId = "app1WzN1IxEnVu3m0";
    let tableId = "tblfDzgRjRKBiIxM3";
    let rowId = data.id;
    let text = "Ansatt - Invitasjonslink";

    // Beregn utløpsdatoen 3 måneder frem i tid
    let expirationdate = new Date();
    expirationdate.setMonth(expirationdate.getMonth() + 24);

    // Formatér datoen til "YYYY-MM-DD"
    let expirationdateFormatted = expirationdate.toISOString().split('T')[0];

    // Generer offentlig lenke
    generatePublicLink({ baseId, tableId, rowId, text, expirationdate: expirationdateFormatted },"responseGenerateEmployerLink");

}

function responseGenerateEmployerLink(data){

    let url = "shareKey="+data.shareKey+"&"+"shareId="+data.shareId;
    //lager denne url på selskapets felt
    let body = {ansattfordelerlink:url};
    patchAirtable("app1WzN1IxEnVu3m0","tblFySDb9qVeVVY5c",activeCompany.airtable,JSON.stringify(body),"responseEmployerLinkCompany")

    let fullUrl = "https://portal.innkjops-gruppen.no/app-portal?"+url;
    const link = document.getElementById("employerlink");
    link.href = fullUrl;
    link.textContent = "Invitasjonslink";
    link.target = "_blank";
    link.style.display = "block";
}

function responseEmployerLinkCompany(data){
  //slå av loading
  document.getElementById("generatelinkloading").style.display = "none";
}
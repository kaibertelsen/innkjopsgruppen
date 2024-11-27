
document.getElementById("chechuserbutton").addEventListener("click", checkUser);

function checkUser() {
    checkUserEmail(document.getElementById("epostinput").value);
}

function checkUserEmail(email) {
    // Regex for å validere e-postadresser
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Sjekk om e-postadressen er gyldig
    if (!emailRegex.test(email)) {
        alert("Vennligst skriv inn en gyldig e-postadresse.");
        return; // Stopper funksjonen hvis e-posten ikke er gyldig
    }

    // Hvis e-posten er gyldig, fortsetter vi med forespørselen
    let body = airtablebodylistAND({ epost: email });
    Getlistairtable("app1WzN1IxEnVu3m0", "tblMhgrvy31ihKYbr", body, "responsecheckUserEmail");

    // Viser animasjonen
    document.getElementById("animation").style.display = "block";
}


function responsecheckUserEmail(data){
    document.getElementById("animation").style.display = "none";
    showUserExistsAlert(rawdatacleaner(data));
}

function showUserExistsAlert(data) {
    // Sjekker om data[0] finnes
    if (data[0]) {
        const userData = data[0];
        
        // Henter ut navn og e-post, eller bruker en standard tekst hvis de ikke finnes
        const name = userData.navn || "Navn ikke tilgjengelig";
        const email = userData.epost || "E-post ikke tilgjengelig";
        
        // Henter ut firmaer brukeren er tilknyttet
        const companies = userData.companyname || [];
        const companyList = Array.isArray(companies) ? companies.join(", ") : companies; // Gjør om til kommaseparert liste
        
        // Bygger meldingen
        const alertMessage = `Denne brukeren eksisterer alt i systemet:\n\nNavn: ${name}\nE-post: ${email}\n\nFirmaer tilknyttet: ${companyList}`;

        // Viser alert med meldingen
        alert(alertMessage);
    } else {
        console.warn("Ingen data funnet for brukeren.");
        //opprett knapp må bli synlig
        document.getElementById("createUserbutton").style.display = "inline-block";
        document.getElementById("userinputsaftercheckdiv").style.display = "block";
        document.getElementById("chechuserbutton").style.display = "none";
    }
}

document.getElementById("createUserbutton").addEventListener("click", creatUser);

function creatUser() {
    const inputs = document.querySelectorAll('#userwrapper input'); // Henter kun input-felter under userwrapper
    const result = {};

    inputs.forEach(input => {
        const key = input.dataset.name; // Henter verdien fra data-name
        if (key) { // Hvis data-name finnes
            const value = input.value.trim(); // Trim for å fjerne unødvendige mellomrom
    
            // Sjekk om feltet er tomt
            if (value === "") {
                alert(`${key} feltet er tomt, vennligst fyll ut dette feltet.`);
                return; // Stopp videre prosessering for dette feltet
            }
    
            // Hvis key er "epost", valider e-postadressen
            if (key === "epost") {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    alert("E-postadressen er ikke gyldig, vennligst skriv inn en korrekt e-post.");
                    return; // Stopp videre prosessering for dette feltet
                }
            }
    
            // Legg til i resultatobjektet hvis alt er OK
            result[key] = value;
        }
    });
    
    result.company = companyId;
        const date = new Date();
        const isoDateString = date.toISOString();
    result.date = isoDateString;
    result.membermail = membermail;

    let group = findObjectByKey(globalGroups, companyGroupId, "airtableId");


    if(group){
        if(group?.typeterms){
            result.typeterms = group.typeterms;
        }
    }else{
        //standard vilkår
        result.typeterms = 1;
    }


    sendUserToZapier(result);
}

async function sendUserToZapier(data) {
    

    const formData = new FormData();
    for (const key in data) {
        const value = data[key];
        // Sjekk om verdien er en array eller objekt og stringify hvis nødvendig
        formData.append(key, Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : value);
    }

    const response = await fetch("https://hooks.zapier.com/hooks/catch/10455257/29gwc4y/", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        document.getElementById("userresponsetext").style.display = "block";
        document.getElementById("userresponsetext").textContent = "Bruker er invitert.";
        document.getElementById("reloadpagebutton").style.display = "block";

        document.getElementById("userwrapper").style.display = "none";

        
    } else {
        console.error("Error sending data to Zapier:", response.statusText);
    }
}


document.getElementById("reloadpagebutton").addEventListener("click", () => {
    location.reload(); // Laster inn nettsiden på nytt
});


function findObjectByKey(globalGroups, searchValue, key) {
    // Bruk Array.find() for å søke etter objektet basert på en spesifikk nøkkel
    const result = globalGroups.find(group => group[key] === searchValue);
    return result || false;
}
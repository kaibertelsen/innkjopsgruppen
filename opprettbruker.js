
document.getElementById("chechuserbutton").addEventListener("click", checkUser);

function checkUser() {
    checkUserEmail(document.getElementById("epostinput").value);
}

function checkUserEmail(email){
    let body =  airtablebodylistAND({epost:email});
    Getlistairtable("app1WzN1IxEnVu3m0","tblMhgrvy31ihKYbr",body,"responsecheckUserEmail");

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
        if (key) { // Hvis data-name finnes, legg til i objektet
            result[key] = input.value;
        }
    });
    result.company = companyId;

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
        document.getElementById("userresponsetext").textContent = "Bruker er opprettet";
        document.getElementById("reloadpagebutton").style.display = "block";

        document.getElementById("userwrapper").style.display = "none";

        
    } else {
        console.error("Error sending data to Zapier:", response.statusText);
    }
}


document.getElementById("reloadpagebutton").addEventListener("click", () => {
    location.reload(); // Laster inn nettsiden på nytt
});

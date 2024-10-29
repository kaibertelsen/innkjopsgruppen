document.getElementById("epostinput").addEventListener("blur", () => {
    checkUserEmail(document.getElementById("epostinput").value); // Kall funksjonen når brukeren forlater feltet
});


function checkUserEmail(email){


    let body =  airtablebodylistAND({email:email});
    Getlistairtable("app1WzN1IxEnVu3m0","tblFySDb9qVeVVY5c",body,"responsecheckUserEmail");
}

function responsecheckUserEmail(data){
    showUserExistsAlert(data);
}


function showUserExistsAlert(data) {
    // Henter ut første objekt i arrayet
    const userData = data[0].fields;
    
    // Henter ut navn og e-post
    const name = userData["navn (from bruker)"] ? userData["navn (from bruker)"][0] : "Navn ikke tilgjengelig";
    const email = userData.epost ? userData.epost[0] : "E-post ikke tilgjengelig";
    
    // Henter ut firmaer brukeren er tilknyttet
    const companies = userData["V2-koblinger"] || [];
    const companyList = companies.join(", "); // Gjør om til kommaseparert liste
    
    // Bygger meldingen
    const alertMessage = `Denne brukeren eksisterer alt i systemet:\n\nNavn: ${name}\nE-post: ${email}\n\nFirmaer tilknyttet: ${companyList}`;

    // Viser alert med meldingen
    alert(alertMessage);
}


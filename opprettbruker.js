document.getElementById("epostinput").addEventListener("blur", () => {
    checkUserEmail(document.getElementById("epostinput").value); // Kall funksjonen når brukeren forlater feltet
});


function checkUserEmail(email){


    let body =  airtablebodylistAND({email:email});
    Getlistairtable("app1WzN1IxEnVu3m0","tblFySDb9qVeVVY5c",body,"responsecheckUserEmail");
}

function responsecheckUserEmail(data){
    let response = rawdatacleaner(data);
    console.log(response);
}
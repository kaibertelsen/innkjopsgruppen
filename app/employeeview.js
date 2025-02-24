function startEmployerView(data){

    console.log("Dette er ansattsiden og dette er data som kommer",data)
    document.getElementById("employeeviewTagButton").click();

    loadEmployeeView(data);
}

function loadEmployeeView(data){

    const companyLogo = document.getElementById("companyLogoElement");
    companyLogo.src = data.companylogo;

    let textMessage = data.comanyname+" er medlem av innkjøpsGRUPPEN AS, og det betyr at du som ansatt kan benytte deg av medlemsfordeler hos et utvalg leverandører.For å gjøre deg bruk av disse fordelene må du trykke på knappen under og opprette en bruker.Dette er helt gratis og uforpliktende.";
    const employeersMessage = document.getElementById("employeerMessage");
    employeersMessage.textContent = textMessage;

    // Konverter JSON-strenger til objekter
    const jsonStrings = data.supplierjson;
    let suppliersArray = convertJsonStringsToObjects(jsonStrings);

    console.log(suppliersArray);
}
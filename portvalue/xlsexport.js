document.getElementById("xlsexportbutton").addEventListener("click", () => {
    // Feltene du vil hente
    const selectedFields = ["lastmodified", "companyorgnr", "companyname", "useremail", "companybrukernavn"];

    // Mapping til nye navn
    const fieldMapping = {
        Name: "Navn",
        orgnr: "Org.nr",
        groupname: "Gruppe",
        winningdate: "Vunnet dato",
        valuegroup: "Abonnement"
    };

    // Hent tekstverdier fra selectorer
    const dashboardGroupSelector = document.getElementById("dashboardgroupselector");
    const customerListSelector = document.getElementById("customerlistselector");

    const dashboardGroupText = dashboardGroupSelector.options[dashboardGroupSelector.selectedIndex].text || "Alle";
    const customerListText = customerListSelector.options[customerListSelector.selectedIndex].text || "Alle";

    // Generer filnavn
    let filename = `Kunder - ${dashboardGroupText} - ${customerListText}`;

    // Eksporter til Excel
    exportData(activeCustomerlist, selectedFields, fieldMapping, filename);
});

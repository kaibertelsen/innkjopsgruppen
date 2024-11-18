function startFollowinglistElement(data) {
    console.log(data);

    const list = document.getElementById("followuplist");
    list.replaceChildren(); // Tømmer holderen for å unngå duplisering

    const elementLibrary = document.getElementById("elementholderfollowup");
    const nodeElement = elementLibrary.querySelector('.rowelementmanuel');

    if (!nodeElement) {
        console.error("Malen '.rowelementmanuel' ble ikke funnet.");
        return;
    }

    // Itererer gjennom selskapene i data-arrayet
    for (const company of data) {
        const rowElement = nodeElement.cloneNode(true);
        list.appendChild(rowElement);

        // Oppdaterer tekstinnhold i rad-elementet med selskapets data
        rowElement.querySelector(".companynamelable").textContent = company.Name || "Ukjent";
        rowElement.querySelector(".winningdate").textContent = company.winningdate || "Ingen dato";
        rowElement.querySelector(".lastfollowingup").textContent = company.lastfollowupdate || "Ingen oppfølging";
        rowElement.querySelector(".daysagain").textContent = company.daytorenewal || "Ingen data";
        rowElement.querySelector(".rewaldate").textContent = company.nextrenewaldate || "Ingen fornyelsesdato";
    }
}


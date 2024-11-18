function startFollowinglistElement(data) {
    console.log(data);

    const list = document.getElementById("followuplist");
    list.replaceChildren(); // Tømmer holderen for å unngå duplisering

    const elementLibrary = document.getElementById("elementfollowinguplist");
    const nodeElement = elementLibrary.querySelector('.rowelementmanuel');

    if (!nodeElement) {
        console.error("Malen '.rowelementmanuel' ble ikke funnet.");
        return;
    }

    // Sorterer data basert på 'nextrenewaldate' (format "YYYY-MM-DD")
    data.sort((a, b) => {
        const dateA = new Date(a.nextrenewaldate);
        const dateB = new Date(b.nextrenewaldate);
        return dateA - dateB; // Sorterer i stigende rekkefølge
    });

    // Itererer gjennom de sorterte dataene
    data.forEach((company, index) => {
        const rowElement = nodeElement.cloneNode(true);

        // Legger til klassen "grayrow" på annenhver rad
        if (index % 2 === 1) {
            rowElement.classList.add("grayrow");
        }

        list.appendChild(rowElement);

        // Oppdaterer tekstinnhold i rad-elementet med selskapets data
        rowElement.querySelector(".companynamelable").textContent = company.Name || "Ukjent";
        rowElement.querySelector(".winningdate").textContent = company.winningdate || "Ingen dato";
        rowElement.querySelector(".lastfollowingup").textContent = company.lastfollowupdate || "Ingen oppfølging";
        rowElement.querySelector(".daysagain").textContent = company.daytorenewal || "Ingen data";
        rowElement.querySelector(".rewaldate").textContent = company.nextrenewaldate || "Ingen fornyelsesdato";
    });
}


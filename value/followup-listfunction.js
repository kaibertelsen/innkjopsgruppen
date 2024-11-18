function startFollowinglistElement(data) {
    console.log(data);

    const list = document.getElementById("elementfollowinguplist");
    list.replaceChildren(); // Tømmer holderen for å unngå duplisering

    const elementLibrary = document.getElementById("elementholderfollowup");
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

    // Bruker DocumentFragment for å optimalisere DOM-manipulasjon
    const fragment = document.createDocumentFragment();

    // Itererer gjennom de sorterte dataene
    data.forEach((company, index) => {
        const rowElement = nodeElement.cloneNode(true);

        // Legger til klassen "grayrow" på annenhver rad
        if (index % 2 === 1) {
            rowElement.classList.add("grayrow");
        }

        // Oppdaterer tekstinnhold i rad-elementet med selskapets data
        rowElement.querySelector(".companynamelable").textContent = company.Name || "Ukjent";
        rowElement.querySelector(".winningdate").textContent = company.winningdate || "Ingen dato";
        rowElement.querySelector(".lastfollowingup").textContent = company.lastfollowupdate || "Ingen oppfølging";
        rowElement.querySelector(".daysagain").textContent = company.daytorenewal || "Ingen data";
        rowElement.querySelector(".rewaldate").textContent = company.nextrenewaldate || "Ingen fornyelsesdato";

        // Viser oppfølgingsnotat hvis det finnes
        if (company.followupnote) {
            const noteElement = rowElement.querySelector(".textlablemanuel");
            const noteContainer = rowElement.querySelector(".note");

            if (noteElement && noteContainer) {
                noteElement.textContent = company.followupnote;
                noteContainer.style.display = "block";
            }
        }

        // Legger til rad-elementet i fragmentet
        fragment.appendChild(rowElement);
    });

    // Legger til alle radene i DOM på én gang
    list.appendChild(fragment);
}



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
        return dateA - dateB;
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

        // Oppdaterer tekstinnhold i rad-elementet med selskapsdata
        rowElement.querySelector(".companynamelable").textContent = company.Name || "Ukjent";
        rowElement.querySelector(".winningdate").textContent = company.winningdate || "Ingen dato";
        rowElement.querySelector(".lastfollowingup").textContent = company.lastfollowupdate || "-";
        rowElement.querySelector(".daysagain").textContent = company.daytorenewal || "Ingen data";
        rowElement.querySelector(".rewaldate").textContent = company.nextrenewaldate || "Ingen fornyelsesdato";

        // Klikkhendelse på companynamelable
        const companyNameLabel = rowElement.querySelector(".companynamelable");
        companyNameLabel.addEventListener("click", () => {
            handleCompanyClick(company.Name, company.airtable);
        });

        // Klikkhendelse på followupStatus
        const followupStatusElement = rowElement.querySelector(".textlablemanuel.lastfollowingup");
        followupStatusElement.addEventListener("click", () => {
            handleFollowupStatusClick(company.Name, company.airtable);
        });

        // Viser oppfølgingsnotat hvis det finnes
        const noteElement = rowElement.querySelector(".textlablemanuel.note");
        const noteContainer = rowElement.querySelector(".textholder.note");

        if (company.followupnote && noteElement && noteContainer) {
            noteElement.textContent = company.followupnote;
            noteContainer.style.display = "block";
        } else if (noteContainer) {
            noteContainer.style.display = "none";
        }

        // Legger til rad-elementet i fragmentet
        fragment.appendChild(rowElement);
    });

    // Legger til alle radene i DOM på én gang
    list.appendChild(fragment);
}

// Funksjon som håndterer klikk på selskapets navn
function handleCompanyClick(name, airtableId) {
    console.log(`Klikket på selskapet: ${name} (ID: ${airtableId})`);
    
    companySelected(airtableId,name);
}

// Funksjon som håndterer klikk på oppfølgingsstatus
function handleFollowupStatusClick(name, airtableId) {
    console.log(`Klikket på oppfølgingsstatus for: ${name} (ID: ${airtableId})`);

    // Spør brukeren om de vil sette status til "Nei"
    const confirmChange = confirm(`Vil du sette oppfølgingsstatus til "Nei" for ${name}?`);
    if (confirmChange) {
        updateFollowupStatus(name, airtableId, "Nei");
    }
}

// Funksjon for å oppdatere oppfølgingsstatus
function updateFollowupStatus(name, airtableId, newStatus) {
    console.log(`Oppdaterer oppfølgingsstatus for: ${name} (ID: ${airtableId}) til ${newStatus}`);
    
}



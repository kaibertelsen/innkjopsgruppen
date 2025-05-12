
populateFellesBesparelseDatoSelector();
function populateFellesBesparelseDatoSelector() {
    const selector = document.getElementById("fellesbesparelsedatoselector");
    selector.innerHTML = ""; // Tøm eksisterende

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indeksert
    const currentDay = today.getDate();

    function formatDate(date) {
        return date.toISOString().split("T")[0]; // yyyy-mm-dd
    }

    // Start og slutt på uke
    const dayOfWeek = today.getDay(); // 0=søndag, 1=mandag
    const mondayThisWeek = new Date(today);
    mondayThisWeek.setDate(currentDay - ((dayOfWeek + 6) % 7));
    const sundayThisWeek = new Date(mondayThisWeek);
    sundayThisWeek.setDate(mondayThisWeek.getDate() + 6);

    const mondayLastWeek = new Date(mondayThisWeek);
    mondayLastWeek.setDate(mondayThisWeek.getDate() - 7);
    const sundayLastWeek = new Date(mondayLastWeek);
    sundayLastWeek.setDate(mondayLastWeek.getDate() + 6);

    // Start og slutt på måned
    const firstThisMonth = new Date(currentYear, currentMonth, 1);
    const firstLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const endLastMonth = new Date(currentYear, currentMonth, 0);

    // Start og slutt på år
    const firstThisYear = new Date(currentYear, 0, 1);
    const firstLastYear = new Date(currentYear - 1, 0, 1);
    const endLastYear = new Date(currentYear - 1, 11, 31);

    const options = [
        { label: "Hittil denne uken", from: formatDate(mondayThisWeek), to: formatDate(today) },
        { label: "Forrige uke", from: formatDate(mondayLastWeek), to: formatDate(sundayLastWeek) },
        { label: "Hittil denne måneden", from: formatDate(firstThisMonth), to: formatDate(today) },
        { label: "Forrige måned", from: formatDate(firstLastMonth), to: formatDate(endLastMonth) },
        { label: "Hittil i år", from: formatDate(firstThisYear), to: formatDate(today) },
        { label: "Forrige år", from: formatDate(firstLastYear), to: formatDate(endLastYear) }
    ];

    // Sett inn <option>-elementer
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Velg periode";
    selector.appendChild(defaultOption);

    options.forEach(opt => {
        const option = document.createElement("option");
        option.value = `${opt.from},${opt.to}`;
        option.textContent = opt.label;
        selector.appendChild(option);
    });
}

function lastInnBrukereIFilter(dataArray) {
    const userSelect = document.getElementById("usernamesselector");
    const brukereSet = new Set();

    dataArray.forEach(item => {
        const bruker = item.username?.trim();
        if (bruker) {
            brukereSet.add(bruker);
        }
    });

    // Sortér og legg til i select
    const sorterteBrukere = Array.from(brukereSet).sort();
    userSelect.innerHTML = `<option value="">Alle brukere</option>`;
    sorterteBrukere.forEach(bruker => {
        const option = document.createElement("option");
        option.value = bruker;
        option.textContent = bruker;
        userSelect.appendChild(option);
    });
}

function visBistandOgAnalysePerKunde(dataArray) {
    const periodeSelector = document.getElementById("fellesbesparelsedatoselector");
    const userSelector = document.getElementById("usernamesselector");
    const container = document.getElementById("listbesparelsesresultat");

    container.innerHTML = "";

    const dateRange = periodeSelector.value;
    const selectedUser = userSelector.value;

    if (!dateRange) {
        container.innerHTML = "<p>Velg periode for å vise oversikt.</p>";
        return;
    }

    const [startDate, endDate] = dateRange.split(",").map(d => new Date(d));

    // Filtrer på dato og evt. bruker
    const filtrert = dataArray.filter(item => {
        const dato = new Date(item.maindate);
        const innenforPeriode = dato >= startDate && dato <= endDate;
        const brukerMatch = !selectedUser || item.username === selectedUser;
        return innenforPeriode && brukerMatch;
    });

    // Grupper per selskap
    const grupper = {};
    filtrert.forEach(item => {
        const navn = item.customer || "Ukjent kunde";
        if (!grupper[navn]) {
            grupper[navn] = {
                bistand: 0,
                analyse: 0,
                brukere: new Set()
            };
        }
        grupper[navn].bistand += parseFloat(item.bistandvalue || 0);
        grupper[navn].analyse += parseFloat(item.analysevalue || 0);
        if (item.username) grupper[navn].brukere.add(item.username);
    });

    const sortert = Object.entries(grupper).sort((a, b) => a[0].localeCompare(b[0]));

    // Total summering
    let totalBistand = 0;
    let totalAnalyse = 0;
    sortert.forEach(([, info]) => {
        totalBistand += info.bistand;
        totalAnalyse += info.analyse;
    });

    // Bygg tabell
    const table = document.createElement("table");
    table.classList.add("fellesbesparelse-table");

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Kunde</th>
            <th style="text-align:right;">Bistand</th>
            <th style="text-align:right;">Analyse</th>
            <th>Brukere</th>
        </tr>`;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    // Total-linje etter header
    const sumRow = document.createElement("tr");
    sumRow.classList.add("total-row");
    sumRow.innerHTML = `
        <td style="font-weight:bold;">Total ${periodeSelector.options[periodeSelector.selectedIndex].text}</td>
        <td style="text-align:right; font-weight:bold;">${totalBistand.toLocaleString("no-NO", {minimumFractionDigits: 2})} kr</td>
        <td style="text-align:right; font-weight:bold;">${totalAnalyse.toLocaleString("no-NO", {minimumFractionDigits: 2})} kr</td>
        <td>-</td>
    `;
    tbody.appendChild(sumRow);

    // Kundelinjer
    sortert.forEach(([kunde, info]) => {
        if (info.bistand === 0 && info.analyse === 0) return;

        const rad = document.createElement("tr");
        rad.innerHTML = `
            <td>
                <a href="#" onclick="visKundeDetaljer('${kunde.replace(/'/g, "\\'")}')" style="color:#2156a4; font-weight:bold; text-decoration:none;">
                    ${kunde}
                </a>
            </td>
            <td style="text-align:right;">${info.bistand.toLocaleString("no-NO", {minimumFractionDigits: 2})} kr</td>
            <td style="text-align:right;">${info.analyse.toLocaleString("no-NO", {minimumFractionDigits: 2})} kr</td>
            <td>${Array.from(info.brukere).join(", ")}</td>
        `;
        tbody.appendChild(rad);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}


document.getElementById("fellesbesparelsedatoselector").addEventListener("change", () => {
    visBistandOgAnalysePerKunde(dachboardtotalarraybufferdata);
});

document.getElementById("usernamesselector").addEventListener("change", () => {
    visBistandOgAnalysePerKunde(dachboardtotalarraybufferdata);
});

function visKundeDetaljer(navn) {
    alert("Viser detaljer for: " + navn);
}

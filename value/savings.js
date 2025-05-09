
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



function visBistandOgAnalysePerKunde(dataArray) {
    const select = document.getElementById("fellesbesparelsedatoselector");
    const container = document.getElementById("listbesparelsesresultat");
    container.innerHTML = "";

    const dateRange = select.value;
    if (!dateRange) {
        container.innerHTML = "<p>Velg en periode for å se oversikten.</p>";
        return;
    }

    const [startDate, endDate] = dateRange.split(",").map(d => new Date(d));

    const grupper = {};
    let totalBistand = 0;
    let totalAnalyse = 0;

    // Grupper per kunde
    dataArray.forEach(item => {
        const dato = new Date(item.maindate);
        if (dato >= startDate && dato <= endDate) {
            const kunde = item.customer || "Ukjent kunde";
            const bistand = parseFloat(item.bistandvalue || 0);
            const analyse = parseFloat(item.analysevalue || 0);
            const bruker = item.username || "Ukjent";

            if (!grupper[kunde]) {
                grupper[kunde] = { bistand: 0, analyse: 0, brukere: new Set() };
            }

            grupper[kunde].bistand += bistand;
            grupper[kunde].analyse += analyse;
            grupper[kunde].brukere.add(bruker);

            totalBistand += bistand;
            totalAnalyse += analyse;
        }
    });

    const sortert = Object.entries(grupper)
        .filter(([_, val]) => val.bistand > 0 || val.analyse > 0)
        .sort((a, b) => a[0].localeCompare(b[0]));

    if (sortert.length === 0) {
        container.innerHTML = "<p>Ingen data i valgt periode.</p>";
        return;
    }

    // Header
    const header = document.createElement("div");
    header.className = "rapport-row rapport-header";
    header.innerHTML = `
        <div class="rapport-col">Kunde</div>
        <div class="rapport-col">Bistand</div>
        <div class="rapport-col">Analyse</div>
        <div class="rapport-col">Brukere</div>
    `;
    container.appendChild(header);

    // Rader
    sortert.forEach(([kunde, summer], index) => {
        const row = document.createElement("div");
        row.className = `rapport-row ${index % 2 === 0 ? "even" : "odd"}`;
        row.innerHTML = `
            <div class="rapport-col"><strong>${kunde}</strong></div>
            <div class="rapport-col">${summer.bistand.toFixed(2)} kr</div>
            <div class="rapport-col">${summer.analyse.toFixed(2)} kr</div>
            <div class="rapport-col">${Array.from(summer.brukere).join(", ")}</div>
        `;
        container.appendChild(row);
    });

    // Totalsum
    const totalRow = document.createElement("div");
    totalRow.className = "rapport-row rapport-footer";
    totalRow.innerHTML = `
        <div class="rapport-col" style="font-weight: bold">Total</div>
        <div class="rapport-col" style="font-weight: bold">${totalBistand.toFixed(2)} kr</div>
        <div class="rapport-col" style="font-weight: bold">${totalAnalyse.toFixed(2)} kr</div>
        <div class="rapport-col" style="font-weight: bold">-</div>
    `;
    container.appendChild(totalRow);
}



document.getElementById("fellesbesparelsedatoselector").addEventListener("change", () => {
    visBistandOgAnalysePerKunde(dachboardtotalarraybufferdata);
});

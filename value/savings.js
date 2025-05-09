
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

function visBesparelseOversikt(dataArray) {
    const select = document.getElementById("fellesbesparelsedatoselector");
    const container = document.getElementById("listbesparelsesresultat");
    const summeringEl = document.getElementById("fellesbesparelsesummering");
    container.innerHTML = ""; // Tøm liste før ny visning

    const dateRange = select.value;
    if (!dateRange) {
        container.innerHTML = "<p>Velg en periode for å se besparelse.</p>";
        if (summeringEl) summeringEl.innerText = "";
        return;
    }

    const [startDate, endDate] = dateRange.split(",").map(d => new Date(d));

    // Filtrer på dato
    const filtrert = dataArray.filter(item => {
        const date = new Date(item.maindate);
        return date >= startDate && date <= endDate;
    });

    // Grupper per kunde og summer
    const grupper = {};
    filtrert.forEach(item => {
        const navn = item.customer || "Ukjent kunde";
        if (!grupper[navn]) {
            grupper[navn] = { totalValue: 0, totalSavings: 0, totalKickback: 0 };
        }

        const value = parseFloat(item.value || 0);
        const kickback = parseFloat(item.kickbackvalue || 0);
        const cut = parseFloat(item.cutvalue || 0);

        grupper[navn].totalValue += value;
        grupper[navn].totalSavings += kickback + cut;
        grupper[navn].totalKickback += kickback;
    });

    // Fjern kunder med nullverdi
    const sortert = Object.entries(grupper)
        .filter(([_, data]) => data.totalValue > 0 || data.totalSavings > 0 || data.totalKickback > 0)
        .sort((a, b) => a[0].localeCompare(b[0]));

    if (sortert.length === 0) {
        container.innerHTML = "<p>Ingen data i valgt periode.</p>";
        if (summeringEl) summeringEl.innerText = "";
        return;
    }

    // Overskriftsrad
    const header = document.createElement("div");
    header.className = "rapport-row rapport-header";
    header.innerHTML = `
        <div class="rapport-col kunde">Kunde</div>
        <div class="rapport-col handel">Handel</div>
        <div class="rapport-col besparelse">Besparelse</div>
        <div class="rapport-col kickback">Kickback</div>
    `;
    container.appendChild(header);

    // Summering totalt
    let sumValue = 0;
    let sumSavings = 0;
    let sumKickback = 0;

    // Rader for hver kunde
    sortert.forEach(([kunde, summer]) => {
        sumValue += summer.totalValue;
        sumSavings += summer.totalSavings;
        sumKickback += summer.totalKickback;

        const row = document.createElement("div");
        row.className = "rapport-row";
        row.innerHTML = `
            <div class="rapport-col kunde">${kunde}</div>
            <div class="rapport-col handel">${summer.totalValue.toLocaleString("no-NO")} kr</div>
            <div class="rapport-col besparelse">${summer.totalSavings.toLocaleString("no-NO")} kr</div>
            <div class="rapport-col kickback">${summer.totalKickback.toLocaleString("no-NO")} kr</div>
        `;
        container.appendChild(row);
    });

    // Vis totalsummer
    if (summeringEl) {
        summeringEl.innerHTML = `
            ${sortert.length} stk. Kunder<br>
            Handel: <strong>${sumValue.toLocaleString("no-NO")} kr</strong><br>
            Besparelse: <strong>${sumSavings.toLocaleString("no-NO")} kr</strong><br>
            Kickback: <strong>${sumKickback.toLocaleString("no-NO")} kr</strong>
        `;
    }
}



document.getElementById("fellesbesparelsedatoselector").addEventListener("change", () => {
    visBesparelseOversikt(dachboardtotalarraybufferdata);
});


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
    const totalTekst = document.getElementById("totalbesparelsetekst");
    
    container.innerHTML = ""; // Tøm liste før ny visning
    totalTekst.innerHTML = ""; // Tøm totaltekst

    const dateRange = select.value;
    if (!dateRange) {
        container.innerHTML = "<p>Velg en periode for å se besparelse.</p>";
        return;
    }

    const [startDate, endDate] = dateRange.split(",").map(d => new Date(d));

    // Filtrer på dato
    const filtrert = dataArray.filter(item => {
        const date = new Date(item.maindate);
        return date >= startDate && date <= endDate;
    });

    // Grupper per customer og summer
    const grupper = {};
    filtrert.forEach(item => {
        const navn = item.customer || "Ukjent kunde";
        if (!grupper[navn]) {
            grupper[navn] = { totalValue: 0, totalSavings: 0 };
        }
        grupper[navn].totalValue += parseFloat(item.value || 0);
        grupper[navn].totalSavings += parseFloat(item.kickbackvalue || 0) + parseFloat(item.cutvalue || 0);
    });

    // Filtrer bort de med 0 i både handel og besparelse
    const sortert = Object.entries(grupper)
        .filter(([_, sum]) => sum.totalValue > 0 || sum.totalSavings > 0)
        .sort((a, b) => a[0].localeCompare(b[0]));

    if (sortert.length === 0) {
        container.innerHTML = "<p>Ingen data i valgt periode.</p>";
        return;
    }

    let sumValue = 0;
    let sumSavings = 0;

    sortert.forEach(([kunde, summer]) => {
        sumValue += summer.totalValue;
        sumSavings += summer.totalSavings;

        const div = document.createElement("div");
        div.classList.add("besparelsesrad");
        div.innerHTML = `
            <strong>${kunde}</strong><br>
            Total handel: ${summer.totalValue.toFixed(1)} kr<br>
            Total besparelse: ${summer.totalSavings.toFixed(1)} kr
        `;
        container.appendChild(div);
    });

    // Vis totalsum i eget tekstelement
    totalTekst.innerHTML = `
        <strong>Totalt for perioden:</strong><br>
        Total handel: ${sumValue.toFixed(1)} kr<br>
        Total besparelse: ${sumSavings.toFixed(1)} kr
    `;
}


document.getElementById("fellesbesparelsedatoselector").addEventListener("change", () => {
    visBesparelseOversikt(dachboardtotalarraybufferdata);
});

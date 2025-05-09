
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

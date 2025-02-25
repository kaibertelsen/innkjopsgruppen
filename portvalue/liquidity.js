document.getElementById("liquidityoverviewselector").addEventListener("change", () => {
    loadLiquidityOverview(calculateMonthlyValues(klientdata))
});

document.getElementById("liquiditytabbutton").addEventListener("click", () => {
    loadLiquidityOverview(calculateMonthlyValues(klientdata));
});



function calculateMonthlyValues(object) {

    let data = filterGroupCompany(object);

    const monthNames = [
        "jan", "feb", "mar", "apr", "mai", "jun",
        "jul", "aug", "sep", "okt", "nov", "des"
    ];

    // Resultatobjekt som grupperer verdier per måned
    const monthlyValues = Array.from({ length: 12 }, (_, i) => ({
        monthname: monthNames[i],
        kickback: 0,
        valuegroup: 0,
        kickbacklastyear: 0,
        valuegrouplastyear: 0,
        monthnumber: i + 1
    }));

    const currentYear = new Date().getFullYear();

    // Iterer gjennom dataene
    data.forEach(obj => {
        // Finn exit-datoen hvis den finnes
        const exitDate = obj.exit ? new Date(obj.exit) : null;

        // --- Håndter valuegroup basert på Invoicedate eller winningdate ---
        const primaryDate = obj.invoicedate || obj.winningdate;
        if (primaryDate) {
            const date = new Date(primaryDate);
            const day = date.getDate(); // Hent dag fra primaryDate
            const month = date.getMonth(); // Hent måned fra primaryDate
            const yearFromExit = exitDate ? exitDate.getFullYear() : null;

            // Lag en justert dato basert på dag/måned fra primaryDate og år fra exitDate
            const adjustedExitDate =
                yearFromExit !== null
                    ? new Date(yearFromExit, month, day)
                    : null;

            const monthIndex = date.getMonth(); // Får 0-basert måned
            const year = date.getFullYear();

            // Sjekk om verdien skal regnes med basert på adjustedExitDate
            const isWithinRange =
                !exitDate || adjustedExitDate === null || adjustedExitDate <= exitDate;

            if (obj.valuegroup && !isNaN(obj.valuegroup)) {
                const value = parseFloat(obj.valuegroup);

                // Regn med for inneværende år hvis dato er innenfor range
                if (isWithinRange) {
                    monthlyValues[monthIndex].valuegroup += value;
                }

                // Regn med for tidligere år hvis dato er innenfor range
                if (year < currentYear && isWithinRange) {
                    monthlyValues[monthIndex].valuegrouplastyear += value;
                }
            }
        }

        // --- Håndter kickback basert på maindate i cashflowjson (uten hensyn til exit) ---
        if (obj.cashflowjson && Array.isArray(obj.cashflowjson)) {
            obj.cashflowjson.forEach(cashflow => {
                if (cashflow.maindate) {
                    const maindate = new Date(cashflow.maindate);
                    const monthIndex = maindate.getMonth(); // Får 0-basert måned
                    const year = maindate.getFullYear();

                    // Legg til kickbackvalue for inneværende år eller tidligere år
                    if (cashflow.kickbackvalue && !isNaN(cashflow.kickbackvalue)) {
                        const kickbackValue = parseFloat(cashflow.kickbackvalue);

                        if (year === currentYear) {
                            monthlyValues[monthIndex].kickback += kickbackValue;
                        } else {
                            monthlyValues[monthIndex].kickbacklastyear += kickbackValue;
                        }
                    }
                }
            });
        }
    });

    return monthlyValues;
}


function findMaxValues(data) {
    let maxValue = 0;
    
    let selectorvalue = document.getElementById("liquidityoverviewselector").value;

    data.forEach(item => {
        if (item[selectorvalue] && item[selectorvalue] > maxValue) {
            maxValue = item[selectorvalue];
        }
    });

    return {
        maxValue // Høyeste verdi totalt
    };
}


function loadLiquidityOverview(data) {
    let maxkvalues = findMaxValues(data);

   
    let factorHeight = maxkvalues.maxValue / 400;

    let selectorvalue = document.getElementById("liquidityoverviewselector").value;
    let selectorvalueshadow = selectorvalue + "lastyear";

    const list = document.getElementById("monthliquidityoverview");
    list.replaceChildren(); // Tømmer holderen for å unngå duplisering

    const elementLibrary = document.getElementById("yearelementlibrary");
    const nodeElement = elementLibrary.querySelector('.monthwrapper');

    for (let month of data) {
        // Klon månedselementet
        const monthElement = nodeElement.cloneNode(true);

        // Hent verdier
        const firstValue = month[selectorvalue] || 0;
        const secondValue = month[selectorvalueshadow] || 0;

        // Animasjon for første element
        const first = monthElement.querySelector(".first");
        const firstText = monthElement.querySelector(".firsttextlable");
        let heightFirst = firstValue / factorHeight;

        animateHeight(first, heightFirst); // Animer høyde
        animateCounter(firstText, 0, Math.round(firstValue / 1000), "", "K"); // Teller fra 0 til verdien

        // Mouseover for første element
        first.addEventListener("mouseover", () => {
            showTooltip(first, `${firstValue.toLocaleString()} kr`);
        });
        first.addEventListener("mouseout", () => {
            hideTooltip(first);
        });

        // Animasjon for andre element
        const second = monthElement.querySelector(".second");
        const secondText = monthElement.querySelector(".secondtextlable");
        let heightSecond = secondValue / factorHeight;

        animateHeight(second, heightSecond); // Animer høyde
        animateCounter(secondText, 0, Math.round(secondValue / 1000), "", "K"); // Teller fra 0 til verdien

        // Mouseover for andre element
        second.addEventListener("mouseover", () => {
            showTooltip(second, `${secondValue.toLocaleString()} kr`);
        });
        second.addEventListener("mouseout", () => {
            hideTooltip(second);
        });

        // Sett månedstekst
        monthElement.querySelector(".monthtext").textContent = month.monthname;

        // Legg til månedselementet i listen
        list.appendChild(monthElement);
    }
}

// Funksjon for å vise tooltip
function showTooltip(element, text) {
    let tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.textContent = text;
    tooltip.style.position = "absolute";
    tooltip.style.backgroundColor = "black";
    tooltip.style.color = "white";
    tooltip.style.padding = "5px";
    tooltip.style.borderRadius = "4px";
    tooltip.style.fontSize = "12px";
    tooltip.style.whiteSpace = "nowrap";
    tooltip.style.pointerEvents = "none";
    tooltip.style.zIndex = "1000";

    // Plasser tooltip i nærheten av elementet
    const rect = element.getBoundingClientRect();
    tooltip.style.top = `${rect.top - 25}px`;
    tooltip.style.left = `${rect.left + rect.width / 2 - 30}px`;

    document.body.appendChild(tooltip);
    element._tooltip = tooltip; // Lagre referansen til tooltip
}

// Funksjon for å skjule tooltip
function hideTooltip(element) {
    if (element._tooltip) {
        document.body.removeChild(element._tooltip);
        element._tooltip = null; // Fjern referansen
    }
}


function animateHeight(element, targetHeight) {
    // Hent nåværende høyde
    const currentHeight = parseFloat(getComputedStyle(element).height) || 0;

    // Sett start- og målhøyde
    element.style.height = `${currentHeight}px`; // Start fra nåværende høyde
    element.style.transition = "height 1s ease-in-out";

    // Animer til målhøyden
    requestAnimationFrame(() => {
        element.style.height = `${targetHeight}px`; // Sett ny høyde
    });
}




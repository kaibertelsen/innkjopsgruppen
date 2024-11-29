function loadLiquidityOverview(data) {

    let maxkvalues = findMaxValues(data);
    let factorHeight = maxkvalues.maxValue / 600; // Høyden på diagrammet

    let selectorvalue = document.getElementById("liquidityoverviewselector").value;
    let selectorvalueshadow = selectorvalue+"lastyear";

    const list = document.getElementById("monthliquidityoverview");
    list.replaceChildren(); // Tømmer holderen for å unngå duplisering

    const elementLibrary = document.getElementById("yearelementlibrary");
    const nodeElement = elementLibrary.querySelector('.monthwrapper');

    for (let month of data) {

        // Klon månedselementet
        const monthElement = nodeElement.cloneNode(true);

        // Sett tekst og høyde for valuegroup
        monthElement.querySelector(".firsttextlable").textContent = month[selectorvalue] ? Math.round(month[selectorvalue] / 1000) + "K" : "0K";
        const first = monthElement.querySelector(".first");
        let heightFirst = month[selectorvalue] ? month[selectorvalue] / factorHeight : 0;
        first.style.height = heightFirst + "px"; // Sett høyden på første element

        // Sett tekst og høyde for kickback
        monthElement.querySelector(".secondtextlable").textContent = month[selectorvalueshadow] ? Math.round(month[selectorvalueshadow] / 1000) + "K" : "0K";
        const second = monthElement.querySelector(".second");
        let heightSecond = month[selectorvalueshadow] ? month[selectorvalueshadow] / factorHeight : 0;
        second.style.height = heightSecond + "px"; // Sett høyden på andre element
        

        // Sett månedstekst
        monthElement.querySelector(".monthtext").textContent = month.monthname;

        // Legg til månedselementet i listen
        list.appendChild(monthElement);
    }
}

function calculateMonthlyValues(data) {
    const monthNames = [
        "jan", "feb", "mar", "apr", "mai", "jun",
        "jul", "aug", "sep", "okt", "nov", "des"
    ];

    // Resultatobjekt som grupperer verdier per måned
    const monthlyValues = Array.from({ length: 12 }, (_, i) => ({
        monthname: monthNames[i],
        kickback: 0,
        valuegroup: 0,
        monthnumber: i + 1
    }));

    // Iterer gjennom dataene
    data.forEach(obj => {
        // --- Håndter valuegroup basert på Invoicedate eller winningdate ---
        const primaryDate = obj.invoicedate || obj.winningdate;
        if (primaryDate) {
            const date = new Date(primaryDate);
            const monthIndex = date.getMonth(); // Får 0-basert måned (0 = januar)

            // Legg til valuegroup hvis det er et gyldig tall
            if (obj.valuegroup && !isNaN(obj.valuegroup)) {
                monthlyValues[monthIndex].valuegroup += parseFloat(obj.valuegroup);
            }
        }

        // --- Håndter kickback basert på maindate i cashflowjson ---
        if (obj.cashflowjson && Array.isArray(obj.cashflowjson)) {
            obj.cashflowjson.forEach(cashflow => {
                if (cashflow.maindate) {
                    const maindate = new Date(cashflow.maindate);
                    const monthIndex = maindate.getMonth(); // Får 0-basert måned

                    // Legg til kickbackvalue hvis det er et gyldig tall
                    if (cashflow.kickbackvalue && !isNaN(cashflow.kickbackvalue)) {
                        monthlyValues[monthIndex].kickback += parseFloat(cashflow.kickbackvalue);
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

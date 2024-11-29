function calculatingPorteDashboard(objects, monthsBack = 12) {
    const now = new Date(); // Nåværende dato
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack); // Juster cutoff-dato basert på monthsBack

    let sumkickback = 0; // For å summere kickbackvalue innenfor tidsrammen
    let sumvaluegroup = 0; // For å summere valuegroup-verdier
    let countValuegroup = 0; // For å telle antall objekter med gyldig valuegroup
    let countKickback = 0; // For å telle antall selskaper med minst én gyldig kickback innenfor tidsrammen
    let countUniqueCompany = 0; // For å telle unike selskaper som har valuegroup eller kickback

    // Hent valgt gruppe fra select-elementet
    const selectedGroup = document.getElementById("dashboardgroupselector").value;

    objects.forEach(obj => {
        // Sjekk om objektet tilhører valgt gruppe, eller inkluder alt hvis "Alle" er valgt
        if (selectedGroup === "" || obj.group === selectedGroup) {
            let hasValuegroup = false; // Spor om objektet har gyldig valuegroup
            let hasValidKickback = false; // Spor om objektet har gyldig kickback

            // Summér valuegroup og tell antall hvis det finnes og er et tall
            if (obj.valuegroup) {
                const valuegroupNumber = parseFloat(obj.valuegroup); // Konverter til tall
                if (!isNaN(valuegroupNumber) && valuegroupNumber > 0) {
                    sumvaluegroup += valuegroupNumber;
                    countValuegroup++; // Øk antall for valuegroup
                    hasValuegroup = true; // Marker at dette objektet har en gyldig valuegroup
                }
            }

            // Håndter cashflowjson for kickback
            if (obj.cashflowjson && Array.isArray(obj.cashflowjson)) {
                obj.cashflowjson.forEach(cashflow => {
                    if (cashflow.maindate) {
                        const maindate = new Date(cashflow.maindate);

                        // Sjekk om maindate er innenfor tidsrammen
                        if (maindate >= cutoffDate && maindate <= now) {
                            // Summér kickbackvalue og tell antall hvis det er et tall
                            if (cashflow.kickbackvalue) {
                                const kickbackNumber = parseFloat(cashflow.kickbackvalue); // Konverter til tall
                                if (!isNaN(kickbackNumber) && kickbackNumber > 0) {
                                    sumkickback += kickbackNumber;
                                    hasValidKickback = true; // Marker at dette objektet har en gyldig kickback
                                }
                            }
                        }
                    }
                });
            }

            // Hvis selskapet har minst én gyldig kickback, øk countKickback én gang
            if (hasValidKickback) {
                countKickback++;
            }

            // Hvis selskapet har enten en gyldig valuegroup eller kickback, øk countUniqueCompany én gang
            if (hasValuegroup || hasValidKickback) {
                countUniqueCompany++;
            }
        }
    });

    // Returner resultatene
    return {
        sumvaluegroup, // Summen av valuegroup
        sumkickback, // Summen av kickbackvalue
        countValuegroup, // Antall objekter med gyldig valuegroup
        countKickback, // Antall selskaper med minst én gyldig kickback
        countUniqueCompany // Antall unike selskaper med valuegroup eller kickback
    };
}

function calculatingSaleDashboard(data) {

    let objects = filterGroupCompany(data);

    const selector = document.getElementById("dashboarddateselector");
    const dateRange = selector.value.split(","); // Henter tidsrammen fra selectoren
    const [startDate, endDate] = dateRange.map(date => new Date(date.trim())); // Konverterer til Date-objekter

    // Resultatobjekt for å lagre summeringene
    const result = {
        winning: { count: 0, valuegroup: 0, kickback: 0 },
        exit: { count: 0, valuegroup: 0, kickback: 0 }
    };

    objects.forEach(obj => {
        // Sjekk at valuegroup er større enn 0 og et gyldig tall
        const valuegroupNumber = obj.valuegroup && !isNaN(obj.valuegroup) ? parseFloat(obj.valuegroup) : 0;
        if (valuegroupNumber <= 0) return; // Hopp over objektet hvis valuegroup <= 0

        // Håndter winningdate
        if (obj.winningdate) {
            const winningDate = new Date(obj.winningdate);
            if (winningDate >= startDate && winningDate <= endDate) {
                result.winning.count++;
                result.winning.valuegroup += valuegroupNumber;
                if (obj.cashflowjson && Array.isArray(obj.cashflowjson)) {
                    obj.cashflowjson.forEach(cashflow => {
                        if (cashflow.kickbackvalue && !isNaN(cashflow.kickbackvalue)) {
                            result.winning.kickback += parseFloat(cashflow.kickbackvalue);
                        }
                    });
                }
            }
        }

        // Håndter exit
        if (obj.exit) {
            const exitDate = new Date(obj.exit);
            if (exitDate >= startDate && exitDate <= endDate) {
                result.exit.count++;
                result.exit.valuegroup += valuegroupNumber;
                if (obj.cashflowjson && Array.isArray(obj.cashflowjson)) {
                    obj.cashflowjson.forEach(cashflow => {
                        if (cashflow.kickbackvalue && !isNaN(cashflow.kickbackvalue)) {
                            result.exit.kickback += parseFloat(cashflow.kickbackvalue);
                        }
                    });
                }
            }
        }
    });

    return result;
}

function filterGroupCompany(objects){
    // Hent valgt gruppe fra select-elementet
    const selectedGroup = document.getElementById("dashboardgroupselector").value;
    var array = [];
    objects.forEach(obj => {
        // Sjekk om objektet tilhører valgt gruppe, eller inkluder alt hvis "Alle" er valgt
        if (selectedGroup === "" || obj.group === selectedGroup) {
            array.push(obj);
        }

    })
return array;
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
    let maxKickback = 0;
    let maxValuegroup = 0;

    data.forEach(item => {
        if (item.kickback > maxKickback) {
            maxKickback = item.kickback;
        }
        if (item.valuegroup > maxValuegroup) {
            maxValuegroup = item.valuegroup;
        }
    });

    const maxValue = Math.max(maxKickback, maxValuegroup); // Høyeste av kickback og valuegroup

    return {
        maxKickback,
        maxValuegroup,
        maxValue // Høyeste verdi totalt
    };
}

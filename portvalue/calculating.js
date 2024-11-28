function calculatingPorteDashboard(objects, monthsBack = 12) {
    const now = new Date(); // Nåværende dato
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack); // Juster cutoff-dato basert på monthsBack

    let sumkickback = 0; // For å summere kickbackvalue innenfor tidsrammen
    let sumvaluegroup = 0; // For å summere valuegroup-verdier

    // Hent valgt gruppe fra select-elementet
    const selectedGroup = document.getElementById("dashboardgroupselector").value;

    objects.forEach(obj => {
        // Sjekk om objektet tilhører valgt gruppe, eller inkluder alt hvis "Alle" er valgt
        if (selectedGroup === "" || obj.group === selectedGroup) {
            // Summér valuegroup hvis det finnes og er et tall
            if (obj.valuegroup) {
                const valuegroupNumber = parseFloat(obj.valuegroup); // Konverter til tall
                if (!isNaN(valuegroupNumber)) {
                    sumvaluegroup += valuegroupNumber;
                }
            }

            // Håndter cashflowjson
            if (obj.cashflowjson && Array.isArray(obj.cashflowjson)) {
                obj.cashflowjson.forEach(cashflow => {
                    if (cashflow.maindate) {
                        const maindate = new Date(cashflow.maindate);

                        // Sjekk om maindate er innenfor tidsrammen
                        if (maindate >= cutoffDate && maindate <= now) {
                            // Summér kickbackvalue hvis det er et tall
                            if (cashflow.kickbackvalue) {
                                const kickbackNumber = parseFloat(cashflow.kickbackvalue); // Konverter til tall
                                if (!isNaN(kickbackNumber)) {
                                    sumkickback += kickbackNumber;
                                }
                            }
                        }
                    }
                });
            }
        }
    });

    // Returner resultatene
    return {
        sumvaluegroup,
        sumkickback
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
        // Håndter winningdate
        if (obj.winningdate) {
            const winningDate = new Date(obj.winningdate);
            if (winningDate >= startDate && winningDate <= endDate) {
                result.winning.count++;
                if (obj.valuegroup && !isNaN(obj.valuegroup)) {
                    result.winning.valuegroup += parseFloat(obj.valuegroup);
                }
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
                if (obj.valuegroup && !isNaN(obj.valuegroup)) {
                    result.exit.valuegroup += parseFloat(obj.valuegroup);
                }
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
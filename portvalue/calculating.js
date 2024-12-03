function calculatingPorteDashboard(objects, monthsBack = 12) {
    const now = new Date(); // Nåværende dato (uten tid)
    now.setHours(0, 0, 0, 0); // Nullstill tid for nøyaktig sammenligning

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

            // Sjekk exit-dato
            const exitDate = obj.exit ? new Date(obj.exit) : null;
            const isExited = exitDate && exitDate <= now; // Sjekk om selskapet er avsluttet i dag eller tidligere

            // Summér valuegroup og tell antall hvis det finnes, er et tall og selskapet ikke har exit før dagens dato
            if ((!exitDate || !isExited) && obj.valuegroup) {
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
                            // Summér kickbackvalue og tell antall hvis det er et tall og ikke 0
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
        exit: { count: 0, valuegroup: 0, kickback: 0 },
        total:{ count: 0, valuegroup: 0, kickback: 0 }
    };

    objects.forEach(obj => {
        // Sjekk at valuegroup er større enn 0 og et gyldig tall
        const valuegroupNumber = obj.valuegroup && !isNaN(obj.valuegroup) ? parseFloat(obj.valuegroup) : 0;
        if (valuegroupNumber <= 0) return; // Hopp over objektet hvis valuegroup <= 0
        result.total.count++;
        result.total.valuegroup += valuegroupNumber;
        // Håndter winningdate
        if (obj.winningdate) {
            const winningDate = new Date(obj.winningdate);
            if (winningDate >= startDate && winningDate <= endDate) {
                result.winning.count++;
                result.winning.valuegroup += valuegroupNumber;
                /* //skal ikke summere kickback på salg
                if (obj.cashflowjson && Array.isArray(obj.cashflowjson)) {
                    obj.cashflowjson.forEach(cashflow => {
                        if (cashflow.kickbackvalue && !isNaN(cashflow.kickbackvalue)) {
                            result.winning.kickback += parseFloat(cashflow.kickbackvalue);
                        }
                    });
                }
                */

            }
        }

        // Håndter exit
        if (obj.exit) {
            const exitDate = new Date(obj.exit);
            if (exitDate >= startDate && exitDate <= endDate) {
                result.exit.count++;
                result.exit.valuegroup += valuegroupNumber;
               /*
                if (obj.cashflowjson && Array.isArray(obj.cashflowjson)) {
                    obj.cashflowjson.forEach(cashflow => {
                        if (cashflow.kickbackvalue && !isNaN(cashflow.kickbackvalue)) {
                            result.exit.kickback += parseFloat(cashflow.kickbackvalue);
                        }
                    });
                }
                */
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

function animateCounter(elementId, startValue = 0, endValue, duration = 500, suffix = "") {
    // Sjekk om duration er et gyldig tall, ellers sett til standardverdi
    if (isNaN(duration) || duration <= 0) {
        duration = 500; // Standardverdi hvis duration ikke er gyldig
    }

    const element = typeof elementId === "string" ? document.getElementById(elementId) : elementId;
    if (!element) {
        console.error(`Element med id "${elementId}" finnes ikke.`);
        return;
    }

    // Hent eksisterende tallverdi fra elementet
    const currentText = element.textContent.replace(/[^0-9.-]+/g, ""); // Fjern suffiks og annet ikke-numerisk
    const currentValue = parseFloat(currentText);

    // Bruk eksisterende verdi som startverdi hvis den er gyldig, ellers bruk oppgitt startValue
    startValue = !isNaN(currentValue) ? currentValue : startValue;

    let startTime;

    function updateCounter(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentValue = Math.round(startValue + (endValue - startValue) * progress);
        element.textContent = currentValue.toLocaleString() + suffix;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }

    requestAnimationFrame(updateCounter);
}

function addSummedKeys(data) {
    const today = new Date(); // Dagens dato
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1); // Dato for 12 måneder siden

    return data.map(company => {
        // Summerer verdiene i cashflowjson innenfor 12 måneder tilbake
        let totalKickback = 0;
        let totalValue = 0;

        if (Array.isArray(company.cashflowjson)) {
            company.cashflowjson.forEach(cashflow => {
                const transactionDate = new Date(cashflow.maindate);
                if (transactionDate >= oneYearAgo && transactionDate <= today) {
                    totalKickback += parseFloat(cashflow.kickbackvalue || 0);
                    totalValue += parseFloat(cashflow.value || 0);
                }
            });
        }

        // Returnerer et nytt objekt med de nye nøklene lagt til
        return {
            ...company,
            kickback: totalKickback,
            value: totalValue
        };
    });
}



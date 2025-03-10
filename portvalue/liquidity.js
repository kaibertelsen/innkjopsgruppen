var listname = "";
var gTerminliste = [];

document.getElementById("liquidityoverviewselector").addEventListener("change", () => {
    //finne inneværende år med format yyyy
    let currentYear = new Date().getFullYear();
    const exportLableDiscription = document.getElementById("exportLableDiscription");
    
    if (document.getElementById("liquidityoverviewselector").value == "refactoring") {
        // hvis verdien er refactoring, så er det en annen byggemåte
        let intervalllist = buildRefactoring(klientdata);
        gTerminliste = intervalllist;
        let monthlyValues = calculateMonthlyInvoiceValue(intervalllist);
        console.log(monthlyValues);
        loadLiquidityInvoiceOverview(monthlyValues);

        listname = "Refakturering - "+currentYear;
        
        exportLableDiscription.textContent = "Last ned refakturering for inneværende år";

    }else if(document.getElementById("liquidityoverviewselector").value == "invoice"){
        let intervalllist = buildRefactoring(klientdata);
        gTerminliste = intervalllist;
        let monthlyValues = calculateMonthlyInvoiceValue(intervalllist);
        console.log(monthlyValues);
        loadLiquidityInvoiceOverview(monthlyValues);
        listname = "Faktureringsplan - "+currentYear;
        exportLableDiscription.textContent = "Last ned faktureringsplan for inneværende år";
    }
    else {
        loadLiquidityOverview(calculateMonthlyValues(klientdata));
    }
});

document.getElementById("liquiditytabbutton").addEventListener("click", () => {
    loadLiquidityOverview(calculateMonthlyValues(klientdata));
});

function buildRefactoring(data) {
    let sumAllIncoices = false

    if (document.getElementById("liquidityoverviewselector").value == "invoice") {
        sumAllIncoices = true;
    }

    // Filtrer ut selskaper uten verdi i valuegroup
    let dataFiltered = data.filter(el => el.valuegroup && el.valuegroup !== "0");

    //filtrer ut selskaper som er gått konkurs insolvency = true
    dataFiltered = dataFiltered.filter(el => el.insolvency == false);

    if(!sumAllIncoices){
        //filtrerer vekk selskaper som er nysalg dvs. det er mindre en 12 mnd. siden vunnetdato
        dataFiltered = dataFiltered.filter(el => {
            let winningDate = new Date(el.winningdate);
            let currentDate = new Date();
            let diff = currentDate - winningDate;
            let diffDays = diff / (1000 * 60 * 60 * 24);
            if (diffDays < 365) {
                return false;
            }
            return true;
        });
    }
    let invoiceList = [];

    dataFiltered.forEach(function (company) {   
        let mainDate = new Date(company.invoicedate || company.winningdate);
        if (isNaN(mainDate.getTime())) {
            console.warn(`Ugyldig faktureringsdato for selskap: ${company.Name}`);
            return; // Hopper over selskapet hvis datoen er ugyldig
        }

        let exitDate = company.exitRegisteredAt || company.exitdate;
        if (exitDate) {
            exitDate = new Date(exitDate);
            if (isNaN(exitDate.getTime())) {
                console.warn(`Ugyldig exitdato for selskap: ${company.Name}`);
                exitDate = null; // Nullstiller exitdato hvis den er ugyldig
            }
        }
        let invoiceInterval = Number(company.invoiceintervall) || 12;
        let valueGroup = Number(company.valuegroup) || 0;

        // Beregn første termindato i inneværende år
        let currentYear = new Date().getFullYear();
        let firstTermDate = new Date(mainDate);
        firstTermDate.setFullYear(currentYear);

        
        console.log(`Starter fakturering for ${company.Name} fra ${firstTermDate.toISOString().split("T")[0]}`);

        // Beregn antall terminer og terminbeløpet
        let counter = 12 / invoiceInterval;
        let termAmount = valueGroup / counter;

        // Loop gjennom hver terminbeløp
        for (let i = 0; i < counter; i++) {
            // Beregn termindato basert på første termindato
            let termDate = new Date(firstTermDate);
            termDate.setMonth(termDate.getMonth() + i * invoiceInterval);
            
            if(sumAllIncoices){
                //alt som skal faktureres
                // ❌ Stopper fakturering KUN basert på exitdate
                let invoiceExitDate = new Date(company.exitdate);
                if (invoiceExitDate && termDate > invoiceExitDate) {
                    console.log(`Fakturering stopper for ${company.Name} ved exitdate: ${exitDate.toISOString().split("T")[0]}`);
                    break;
                }
            }

            
            let termin = {
                company: company.Name,
                companyvat: company.orgnr || "",
                companyid: company.airtable,
                valuegroup: valueGroup,
                terminbelop: termAmount,
                termin: i + 1,
                terminintervall: invoiceInterval,
                termindate: termDate.toISOString().split("T")[0], // Formatert som YYYY-MM-DD
                maindate: mainDate.toISOString().split("T")[0],
            };


            invoiceList.push(termin);
        }

        //hvis exitRegisteredAt er satt, så legg denne i 
        let exitRegisteredAt = new Date(company.exitRegisteredAt);
        if(exitRegisteredAt && exitRegisteredAt.getFullYear() == currentYear){
            let exitTermin = {
                company: company.Name,
                companyvat: company.orgnr || "",
                companyid: company.airtable,
                exitvalue: valueGroup,
                exitdate: exitDate.toISOString().split("T")[0], // Formatert som YYYY-MM-DD
            };
            invoiceList.push(exitTermin);
        }

    });

    // Sorter terminene etter termindato
    invoiceList.sort((a, b) => new Date(a.termindate) - new Date(b.termindate));


    return invoiceList;
}

function calculateMonthlyInvoiceValue(data) {   
    
    const monthNames = [
        "jan", "feb", "mar", "apr", "mai", "jun",
        "jul", "aug", "sep", "okt", "nov", "des"
    ];

    // Resultatobjekt som grupperer verdier per måned
    const monthlyValues = Array.from({ length: 12 }, (_, i) => ({
        monthname: monthNames[i],
        terminbelop: 0,
        exitvalue: 0,
        monthnumber: i + 1
    }
    )); 

    const currentYear = new Date().getFullYear();

    // Iterer gjennom dataene
    data.forEach(obj => {

        //hvis det er faltura verdier
        if (obj.termindate) {
        //summere terminbeløp per måned
            const termDate = new Date(obj.termindate);
            const monthIndex = termDate.getMonth(); // Får 0-basert måned
            const year = termDate.getFullYear();
            const termAmount = parseFloat(obj.terminbelop);
            const exitAmount = parseFloat(obj.exitvalue) || 0;
            // Legg til terminbeløp for inneværende år
            if (year === currentYear) {
                monthlyValues[monthIndex].terminbelop += termAmount;
                monthlyValues[monthIndex].exitvalue += exitAmount;
            }

        }else if(obj.exitdate){
            //det er exitbeløp
            const termDate = new Date(obj.exitdate);
            const monthIndex = termDate.getMonth(); // Får 0-basert måned
            const year = termDate.getFullYear();
            const termAmount = 0;
            const exitAmount = parseFloat(obj.exitvalue) || 0;

             // Legg til terminbeløp for inneværende år
            if (year === currentYear) {
                monthlyValues[monthIndex].terminbelop += termAmount;
                monthlyValues[monthIndex].exitvalue += exitAmount;
            }
        }

    });

    return monthlyValues;

}

function loadLiquidityInvoiceOverview(data) {

    
    const exportOverviewList = document.getElementById("exportOverviewList");
    exportOverviewList.parentElement.style.display = "flex";
    
    let isInvoice = false;
    if(document.getElementById("liquidityoverviewselector").value == "invoice"){
        isInvoice = true;
      
    }

      //summere alt i terminbelop
      let sumAllIncoices = data.reduce((acc, cur) => {
        acc += cur.terminbelop;
        return acc;
        }
        ,   0);
    const sumthisyear = document.getElementById("sumthisyear");
    sumthisyear.textContent = "Sum: "+ Math.round(sumAllIncoices / 1000).toLocaleString() + " K";

    // Finn høyeste verdi for å skalere høyden på elementene
    let maxkvales = data.reduce((acc, cur) => {
        if (cur.terminbelop > acc) {
            acc = cur.terminbelop;
        }
        if (cur.exitvalue > acc) {
            acc = cur.exitvalue;
        }
        return acc;
    }
    , 0);   
    
   
    let factorHeight = maxkvales / 400;

    let selectorvalue = document.getElementById("liquidityoverviewselector").value;
    let selectorvalueshadow = selectorvalue + "lastyear";

    const list = document.getElementById("monthliquidityoverview");
    list.replaceChildren(); // Tømmer holderen for å unngå duplisering

    const elementLibrary = document.getElementById("yearelementlibrary");
    const nodeElement = elementLibrary.querySelector('.monthwrapper');

    //beskrivelse av data
    const descriptionwrapper = document.getElementById("descriptionwrapper");
    const descriptionlable = descriptionwrapper.querySelector('.descriptionlable');
    const lable1 = descriptionwrapper.querySelector('.lable1');
    const lable2 = descriptionwrapper.querySelector('.lable2');
    if(isInvoice){
        descriptionlable.textContent = "Faktureringsplan for inneværende år, konkurser er fjernet";
        lable1.textContent = "Fakturering";
        lable2.textContent = "Oppsigelser";
    }else{
        descriptionlable.textContent = "Faktureringsverdi for inneværende år. Nysalg og konkurser er fjernet";
        lable1.textContent = "Refakturering";
        lable2.textContent = "Oppsigelser";
    }


    for (let month of data) {
        // Klon månedselementet
        const monthElement = nodeElement.cloneNode(true);

        // Hent verdier
        const firstValue = month.terminbelop || 0;
        const secondValue = month.exitvalue || 0;

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

        if(isInvoice){  

        }else{
            //hvis der er refakturering
            //sette prosentlable
            const procentvalue = monthElement.querySelector(".procentvalue");
            let procent = 0;
            if(firstValue > 0){
                procent = (secondValue / firstValue) * 100;
            }
            procentvalue.textContent = procent.toFixed(1) + "%";
            procentvalue.parentElement.style.display = "block";
        }

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


document.getElementById("exportOverviewList").addEventListener("click", () => {
   
    // Mapping
    const fieldMapping = {
        termindate: "Termin dato",
        company: "Navn",
        companyvat: "Org.nr",
        valuegroup: "Avtaleverdi",
        terminbelop: "Terminbeløp",
        termin: "Termin",
        terminintervall: "Intervall mnd.",
        maindate: "Første fakturadato",
        exitdate: "Exit dato",
        exitvalue: "Exit verdi",
        companyid: "Airtable",
    };
    let list = gTerminliste;

    // Eksporter til Excel
    exportData(list, fieldMapping, listname);
    
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

    const exportOverviewList = document.getElementById("exportOverviewList");
    exportOverviewList.parentElement.style.display = "none";

    const sumthisyear = document.getElementById("sumthisyear");
    let isValugroup = true;
    let maxValue = 0;
    if (document.getElementById("liquidityoverviewselector").value == "valuegroup") {
        

         // Finn høyeste verdi for å skalere høyden på elementene
         maxValue = data.reduce((acc, cur) => {
            if (cur.valuegroup > acc) {
                acc = cur.valuegroup;
            }
            if (cur.valuegrouplastyear > acc) {
                acc = cur.valuegrouplastyear;
            }
            return acc;
        }
        , 0);   

        //summere alt i terminbelop
        let sumAllIncoices = data.reduce((acc, cur) => {
        acc += cur.valuegroup;
        return acc;
        }
        ,   0);
    
        sumthisyear.textContent = "Sum abonnement:"+ Math.round(sumAllIncoices / 1000).toLocaleString() + " K";

    }else{
        isValugroup = false;
        // Finn høyeste verdi for å skalere høyden på elementene
        maxValue = data.reduce((acc, cur) => {
            if (cur.kickback > acc) {
                acc = cur.kickback;
            }
            if (cur.kickbacklastyear > acc) {
                acc = cur.kickbacklastyear;
            }
            return acc;
        }
        , 0);   

        //summere alt i handel
        let sumAllIncoices = data.reduce((acc, cur) => {
        acc += cur.kickback;
        return acc;
        }
        ,   0);
        
        sumthisyear.textContent = "Sum kickback:"+ Math.round(sumAllIncoices / 1000).toLocaleString() + " K";


    }

    
    
 
    let factorHeight = maxValue / 400;

    let selectorvalue = document.getElementById("liquidityoverviewselector").value;
    let selectorvalueshadow = selectorvalue + "lastyear";

    const list = document.getElementById("monthliquidityoverview");
    list.replaceChildren(); // Tømmer holderen for å unngå duplisering

    const elementLibrary = document.getElementById("yearelementlibrary");
    const nodeElement = elementLibrary.querySelector('.monthwrapper');

    //beskrivelse av data
    const descriptionwrapper = document.getElementById("descriptionwrapper");
    const descriptionlable = descriptionwrapper.querySelector('.descriptionlable');
    const lable1 = descriptionwrapper.querySelector('.lable1');
    const lable2 = descriptionwrapper.querySelector('.lable2');

    if(isValugroup){
        descriptionlable.textContent = "Avtaleverdi for inneværende år, basert på fornyelsedato";
        lable1.textContent = "Abonnement";
        lable2.textContent = "Abonnement forrige år";
    }else{
        descriptionlable.textContent = "Kickback for inneværende år, basert på handelsdato";
        lable1.textContent = "Kickback";
        lable2.textContent = "Kickback forrige år";
    }


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




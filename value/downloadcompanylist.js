var SelectedCompanyInFirstTab = null;


function loadInAllCompanyes(){
    let klientid = "rec1QGUGBMVaqxhp1";
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC",klientid,"respondAllCompanyes");
    //last ned oppfølginger
    let body = airtablebodylistAND({type:"link"});
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC","reckTUK3Ia0LghhaI","respondLinkList");
}
  
    

function respondAllCompanyes(data){
        // Sjekk om data.fields.membersjson eksisterer og er en array
        if (!data || !data.fields || !data.fields.membersjson || !Array.isArray(data.fields.membersjson)) {
            console.error("Ugyldig dataformat: Forventet et objekt med 'fields.membersjson' som en array.");
            return;
        }
        // Hent arrayen og konverter JSON-strenger til objekter
        const jsonStrings = data.fields.membersjson;
        const objects = convertJsonStringsToObjects(jsonStrings);

        buffercompanydata = objects;
        loadcompany(objects);

        loadfollowingupselector();
        prepareStartFolloupList(objects);

}
function downloadcompanyBuffer(){   
	//hente ned alle firma
  //GETairtable(baseid,tableBufferid,"recD8lnmcLc7124f8","respondBuffer") 
}

function respondBuffer(data,id){
 console.log(data);
 
 fetchAndParseJSON(data.fields.datafile[0].url);
}


// Funksjon for å laste ned og parse JSON-filen
async function fetchAndParseJSON(url) {
    try {
        // Last ned JSON-filen
        const response = await fetch(url);

        // Sjekk om responsen er ok (statuskode 200–299)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        // Parse JSON-filen til et JavaScript-objekt
        const data = await response.json();

        // Logg dataen for å bekrefte at den ble lastet og parsedd riktig
        console.log(data);
        buffercompanydata = data;
        loadcompany(data);
        // Du kan nå bruke dataen som et vanlig JavaScript-objekt
        // for eksempel:
        // console.log(data.someProperty);
        
    } catch (error) {
        // Håndter eventuelle feil
        console.error('There was a problem with the fetch operation:', error);
    }
}

function companySelected(company){
    //laste ned alle besparelseslinjene på dette selskapet 
    document.getElementById("customernametext").innerHTML = company.name;
    document.getElementById("companyvolumwrapper").style.display = "block";

    companyId = company.airtable;
    SelectedCompanyInFirstTab = company;
    let body = bodyFindlist(company.airtable,"customerid");
    Getlistairtable(baseid,"tbly9xd4ho0Z9Mvlv",body,"respondcustomerlist");
  
    //tømm data ang ansattportal
    clearcompanyDetaljes();

    //tøm tidligere eposter ++ i oppfølgingen
    const resivername = document.getElementById("resivername");
    resivername.value = "";
    const emailinput = document.getElementById("emailinput");
    emailinput.value = "";
    
  
    //list companycutsettings
    if(company.cutsettings){
        listcompanycutsettings(company.cutsettings);
    }

    //hvis dette selskapet tilhører en hovedselskap
    if(company?.parentcompany){
        viewGroupData(company);
    }else{
        const groupvalueConteiner = document.getElementById("groupvalueConteiner");
        groupvalueConteiner.style.display = "none";
    }
}

function viewGroupData(company) {
    const parentcompanyname = company.parentcompanyname;
    const parentcompany = company.parentcompany;

    //sette checbox om denne skal hvises på link til kunde
    const groupLineVisible = document.getElementById("groupLineVisible");
    groupLineVisible.checked = company.groupsumtolink || false;

    if (!parentcompany) {
        console.log("Ingen parentcompany satt for dette selskapet.");
        return;
    }

    // Filtrer alle selskaper med samme parentcompany
    const groupdata = buffercompanydata.filter(c => c.parentcompany === parentcompany);

    let totalSum = 0;
    const selector = document.getElementById("dashboarddateselector");

    // Hent valgt periode fra selector og splitte til start og slutt
    const [startDateStr, endDateStr] = selector.value.split(",");
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    groupdata.forEach(c => {
        if (Array.isArray(c.cashflowjson)) {
            // Filtrer cashflow entries som er innenfor valgt tidsperiode
            const filteredEntries = c.cashflowjson.filter(entry => {
                const entryDate = new Date(entry.maindate);
                return entryDate >= startDate && entryDate <= endDate;
            });

            // Summer opp cut for de filtrerte
            filteredEntries.forEach(entry => {
                const cut = Number(entry.cut);
                const bistand = Number(entry.bistand);
                const analyse = Number(entry.analyse);
                if (!isNaN(cut)) {
                    totalSum += cut+bistand+analyse;
                }
            });
        }
    });

    //må summen oppdateres på selskapet
    let orginal = company.sumgroupsavings || 0;
    if(orginal != totalSum){
        company.sumgroupsavings = totalSum;
        //oppdatere på server
        let body = JSON.stringify({sumgroupsavings:totalSum});
        
        PATCHairtable(baseid,"tbly9xd4ho0Z9Mvlv",company.airtable,body,"updateCompanySumGroupSavings");
    }

    const textGroupElement = document.getElementById("textGroupinfo");
    let totalCutText = totalSum.toLocaleString('no-NO', { style: 'currency', currency: 'NOK' });
    
    textGroupElement.innerHTML = `Summen av besparelse for alle selskaper i gruppen <strong>${parentcompanyname}</strong> er: <strong><u>${totalCutText}</u></strong>`;
    

    const groupvalueConteiner = document.getElementById("groupvalueConteiner");
    groupvalueConteiner.style.display = "block";

}

function updateCompanySumGroupSavings(data){
    console.log(data);
}

document.getElementById("groupLineVisible").addEventListener("change", function () {
   

    //send til server
    let body = JSON.stringify({groupsumtolink:this.checked});

    PATCHairtable(baseid,"tbly9xd4ho0Z9Mvlv",SelectedCompanyInFirstTab.airtable,body,"updateCompanyGroupSumToLink");
});

function updateCompanyGroupSumToLink(data){
    console.log(data);
}



function listcompanycutsettings(data){
    
    const cutsettingsConteiner = document.getElementById("companysettingslist");
    cutsettingsConteiner.innerHTML = "";

    const cutsettingselementlibrary = document.getElementById("cutsettingselementlibrary");
    const nodeelement = cutsettingselementlibrary.querySelector(".cutsettingsrowelement");

    //hvis det er mer en 0 elementer
    const companycutlableheader = document.getElementById("companycutlableheader");
    if(data.length>0){
        companycutlableheader.style.display = "block";
    }else{
        companycutlableheader.style.display = "none";
    }
    data.forEach(item => {
        const cutsettingsrow = nodeelement.cloneNode(true);

        const supplier = cutsettingsrow.querySelector(".supplier");
        supplier.textContent = item.suppliername || "";

        const cut = cutsettingsrow.querySelector(".cut");
        let mode = "";
        if(item.mode == "1"){
            mode = "%";
        }else if(item.mode == "2"){
            mode = "øre/l";
        }else if(item.mode == "3"){
            mode = "kr/m³";
        }
        cut.textContent = item.cut + " " + mode;

        const user = cutsettingsrow.querySelector(".user");
        user.textContent = item.username || "";

        const deletebutton = cutsettingsrow.querySelector(".delete");
        deletebutton.addEventListener("click", () => {

            // Lagre endringene på server
            DELETEairtable("app1WzN1IxEnVu3m0","tbljS13MOpiiyCWPJ",item.airtable,"deleteCompanyCutSettings");


            // Slett elementet fra arrayen
            const index = data.indexOf(item);
            data.splice(index, 1);
            
            // Oppdater visningen
            listcompanycutsettings(data);

            
        });

        cutsettingsConteiner.appendChild(cutsettingsrow);
    });

}

function deleteCompanyCutSettings(data){
    console.log(data);
}
const companysettingsConteiner = document.getElementById("companysettingsConteiner");
companysettingsConteiner.style.display = "none";

function respondcustomerlist(data,id){
    //laste ned alle besparelseslinjene på dette selskapet  
    companydatalines = rawdatacleaner(data);
    mainrootcompanylist(companydatalines);

    //synligjør companysettings
    companysettingsConteiner.style.display = "block";
}

function mainrootcompanylist(data){
    //sette editwrapper tilbake
    placeEditorWrapperBack();

    //filtrere på valgt dato i velger
    const selector = document.getElementById("dashboarddateselector");
    let filterlist = periodArrayCleaner("maindate","seconddate",selector,data); 

    //regne ut ny dato på linjer med repeating
    filterlist = newDateFromRepeating(filterlist);

    //denne er ny forløpig
    let groupCahflow = groupSuppliersCashflow(filterlist);
    
    let sum1 = listcompanyinview(groupCahflow);
    //liste opp bistand
    let sum2 = listcompanybistand(findObjectsProperty("type","bistand",filterlist));
    //lister opp analyse
    let sum3 = listcompanyanalyse(findObjectsProperty("type","analyse",filterlist));
    document.getElementById("sumtotalb").innerHTML = valutalook(round(sum1+sum2+sum3))+" Kr";
    document.getElementById("sumtotalb").style.display = "inline-block";
  
// Hent valgt indeks
    let selectedIndex = selector.selectedIndex;
    // Hent valgt option
    let selectedOption = selector.options[selectedIndex];
    let tekstutenPunktum = selectedOption.text.replace('.', '');
  document.getElementById("periodetextviewer").innerHTML = tekstutenPunktum.toLowerCase()+".";
  //legger inn i input
  document.getElementById("valuesaved").value = valutalook(round(sum1+sum2+sum3))+" Kr";
  
  
  
  //last ned brukere på dette selskapet
  moreAbouteCompany();
}

function newDateFromRepeating(data) {
    const currentYear = new Date().getFullYear();
  
    data.forEach(item => {
      if (item.repeating && item.maindate) {
        const originalDate = new Date(item.maindate);
        
        // Lag ny dato med dagens år, men samme måned og dag
        const updatedDate = new Date(currentYear, originalDate.getMonth(), originalDate.getDate());
  
        // Sett ny dato (kan være string eller Date-objekt, avhengig av bruk)
        item.maindate = updatedDate.toISOString().split("T")[0]; // format: yyyy-mm-dd
      }
    });
  
    return data;
}
  
  

function filterFunction() {
    var input, filter, div, a, i;
    input = document.getElementById("dropdownInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("dropdownMenu");
    a = div.getElementsByTagName("a");

    // Show the dropdown menu
    div.classList.add("show");

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < a.length; i++) {
        txtValue = a[i].textContent || a[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

const debounceFilterFunction = debounce(filterFunction, 300);

function clearDropdown() {
    var dropdownMenu = document.getElementById("dropdownMenu");
    dropdownMenu.innerHTML = '';
}

function loadDropdown(data) {
    var dropdownMenu = document.getElementById("dropdownMenu");
    clearDropdown(); // Clear existing options first
    data.forEach(item => {
        var a = document.createElement("a");
        a.href = "#";
        a.textContent = item.name;
        a.dataset.id = item.id; // Store id in a data attribute
        a.onclick = function() {
            handleItemClick(item);
        };
        dropdownMenu.appendChild(a);
    });
}

function handleItemClick(item) {
    // Your function logic here
   // alert("You clicked on " + name + " with ID " + id);
    companySelected(item);
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('#dropdownInput')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}


function filterFunctionsupplier() {
    var input, filter, div, a, i;
    input = document.getElementById("dropdownInputsupplier");
    filter = input.value.toUpperCase();
    div = document.getElementById("dropdownMenusupplier");
    a = div.getElementsByTagName("a");
    //resette supplierid
    input.dataset.airtable = "";
    // Show the dropdown menu
    div.classList.add("show");

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < a.length; i++) {
        txtValue = a[i].textContent || a[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}


function clearDropdownsupplier() {
    var dropdownMenu = document.getElementById("dropdownMenusupplier");
    dropdownMenu.innerHTML = '';
}

function loadDropdownsupplier(data) {
    var dropdownMenu = document.getElementById("dropdownMenusupplier");
    clearDropdownsupplier(); // Clear existing options first
    data.forEach(item => {
        var a = document.createElement("a");
        a.href = "#";
        a.textContent = item.name;
        a.dataset.id = item.id; // Store id in a data attribute
        var cut = false;
        if(item?.defaultcut){
        cut = item.defaultcut;
        }
        a.onclick = function() {
            handleItemClicksupplier(item.id, item.name, cut);
        };
        dropdownMenu.appendChild(a);
    });
}

function handleItemClicksupplier(id, name, cut) {
    // Your function logic here
    //alert("You clicked on " + name + " with ID " + id);
    supplierSelected(id,name,cut);
   
}




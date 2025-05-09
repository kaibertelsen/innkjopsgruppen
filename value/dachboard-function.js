/*
function getKlientdata(){
    let klientid = "rec1QGUGBMVaqxhp1";
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC",klientid,"klientresponse")
}

function klientresponse(data) {
    // Sjekk om data.fields.membersjson eksisterer og er en array
    if (!data || !data.fields || !data.fields.membersjson || !Array.isArray(data.fields.membersjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields.membersjson' som en array.");
        return;
    }

    // Hent arrayen og konverter JSON-strenger til objekter
    const jsonStrings = data.fields.membersjson;
    const objects = convertJsonStringsToObjects(jsonStrings);
    klientdata = objects;
    loadGroupSelector(getUniqueGroups(objects));
    loadDateSelector();

    loadDashboardporte(calculatingPorteDashboard(objects));
    loadDashboardsale(calculatingSaleDashboard(objects));
    loadLiquidityOverview(calculateMonthlyValues(objects));

    listCustomer(objects);
    
}
*/


function responddaschboard(data,id){
    //lager array av cash
    dachboardtotalarraybufferdata = daschboardDataToArray(data);
    
    //load group
    loadGroupFromDashboard(dachboardtotalarraybufferdata);
    
    
    loaddaschboard(dachboardtotalarraybufferdata);
    updateOpenlistPage("");

    // Etter at du har satt user
    lastInnBrukereIFilter(dachboardtotalarraybufferdata);
}
    
function loaddaschboard(data){
    
    //filtrere på valgt dato i velger
    const selector = document.getElementById("dashboarddateselector");
    cashflowdatoarray = periodArrayCleaner("maindate","maindate",selector,data);
    
    //filtrere på grupper
    cashflowdatoarray = clearForGroup(cashflowdatoarray);
    //summere verdiene for dachboard
    var filtreddata = daschboardSummer(cashflowdatoarray);
    
    
    document.getElementById("dachboardvolum").innerHTML = valutalook(round(filtreddata.value, 0))+" Kr";
    document.getElementById("dachboardcut").innerHTML = valutalook(round(filtreddata.cutvalue, 0))+" Kr";
    document.getElementById("dachboardbistandvalue").innerHTML = valutalook(round(filtreddata.bistandvalue, 0))+" Kr";
    document.getElementById("dachboardanalysevalue").innerHTML = valutalook(round(filtreddata.analysevalue, 0))+" Kr";
    document.getElementById("dachboardkickbackvalue").innerHTML = valutalook(round(filtreddata.kickbackvalue, 0))+" Kr";
    listdachboardtopp(cashflowdatoarray);
}

function periodArrayCleaner(date1property, date2property, selector, data) {
    const newarray = [];
  
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const isRepeating = item.repeating === true;
      const isInPeriod = dateselectorPeriode(item[date1property], item[date2property], selector);
  
      if (isRepeating || isInPeriod) {
        const copy = {};
        Object.keys(item).forEach(key => {
          copy[key] = item[key];
        });
        newarray.push(copy);
      }
    }
  
    return newarray;
}

function listdachboardtopp(data){
    
    //dachboardbuffer = data;
    //sorter etter volum
    var supplierarray = makeArrayFrom(data,"supplier");
    listtopp(sortArrayValue(supplierarray),"toppsupplierlist",1);
    
    var customerarray = makeArrayFrom(data,"customer");
    listtopp(sortArrayKickback(customerarray),"toppcustomerlist",3);
    
    var supplierkickbak = makeArrayFrom(data,"supplier");
    listtopp(sortArrayKickback(supplierkickbak),"toppkickbacklist",2);
    
}

function daschboardDataToArray(data){
    
    var valuearray = data.fields.valuecashflow;
    var cutvaluearray = data.fields.cutvaluecashflow;
    var suppliernamearray = data.fields.suppliername;
    var customernamearray = data.fields.customername;
    var kickbackarray = data.fields.kickbackvaluecashflow;
    var maindate = data.fields.maindate;
    var seconddate = data.fields.seconddate;
    var airtable = data.fields.cashflowairtable;
    var bistandvaluearray = data.fields.bistandvaluecashflow;
    var analysevaluearray = data.fields.analysevaluecashflow;
    var grouparray = data.fields.customergroup;
    var groupnamearray = data.fields.customergroupname;
    var usernamearray = data.fields.username;
    var newarray = [];
    
    
    
    for(var i = 0;i<suppliernamearray.length;i++){
    newarray.push({
        airtable:airtable[i],
        maindate:maindate[i],
        seconddate:seconddate[i],
        value:valuearray[i],
        cutvalue:cutvaluearray[i],
        supplier:suppliernamearray[i],
        customer:customernamearray[i],
        kickbackvalue:kickbackarray[i],
        bistandvalue:bistandvaluearray[i],
        analysevalue:analysevaluearray[i],
        group:grouparray[i],
        groupname:groupnamearray[i],
        username:usernamearray[i]
        });
    }
    
    return newarray;
    
}



function daschboardSummer(data){
    
    var value = 0;
    var cutvalue = 0;
    var bistandvalue = 0;
    var analysevalue = 0;
    var kickbackvalue = 0;
    var countline = 0;
    
    for(var i = 0;i<data.length;i++){
     
            value = value+data[i].value;
            cutvalue = cutvalue+data[i].cutvalue;
            bistandvalue = bistandvalue+data[i].bistandvalue;
            analysevalue = analysevalue+data[i].analysevalue;
            kickbackvalue = kickbackvalue+data[i].kickbackvalue;
            countline++ 
        
    }
    
    
    return {value:value,cutvalue:cutvalue,bistandvalue:bistandvalue,analysevalue:analysevalue,kickbackvalue:kickbackvalue,countline:countline}
    
}
    
function dateselectorPeriode(date1, date2, selector) {
        let periode = selector.value.split(",");
        
        // Konverter datoene til Date-objekter hvis de ikke allerede er det
        let sjekkDato1 = new Date(date1);
        let sjekkDato2 = new Date(date2);
        let periodeStart = new Date(periode[0]);
        let periodeSlutt = new Date(periode[1]);
    
        // Sjekk om sjekkDato1 er lik eller etter periodeStart og sjekkDato2 er før eller lik periodeSlutt
        let erDatoInnenfor = sjekkDato1 >= periodeStart && sjekkDato2 <= periodeSlutt;
    
        return erDatoInnenfor;
}
     
function makeArrayFrom(data,property){
    
    var Newarray = [];
    
    for(var i = 0;i<data.length;i++){
    
        var object = findObjectProperty("name",data[i][property],Newarray);
        if(object){
        //fant en oppføring i array legge til volum
        object.value = object.value+data[i].value;
        object.cutvalue = object.cutvalue+data[i].cutvalue;
        object.kickbackvalue = object.kickbackvalue+data[i].kickbackvalue;
        }else{
        //lag en ny oppføring
        Newarray.push({name:data[i][property],value:data[i].value,cutvalue:data[i].cutvalue,kickbackvalue:data[i].kickbackvalue});
        }
    }
    
    //sorter med høyestvolum øverst
    return Newarray
    
}

function listtopp(data,listid,layout){
    
    const list = document.getElementById(listid);
    removeAllChildNodes(list);
    
    const listholder = document.getElementById("toppsupplierlistelementholder");
    const noderow = listholder.getElementsByClassName("mal")[0];
       
    var count = data.length;
    if(count>5){
        count = 5;
    }
    
        for(var i = 0;i<count;i++){
        
              const clonerow = noderow.cloneNode(true);
                    clonerow.classList.remove("mal");
                    clonerow.classList.add("copy")
                    clonerow.dataset.index = i;
                    clonerow.id = "row"+i;
                    
                    const c1 = clonerow.getElementsByClassName("c1")[0];
                    c1.innerHTML = data[i].name;
                    
                    if(layout == 1){
                    const c2 = clonerow.getElementsByClassName("c2")[0];
                    c2.innerHTML = valutalook(round(data[i].value/1000, 0))+" K"
    
                    const c3 = clonerow.getElementsByClassName("c3")[0];
                    c3.innerHTML = valutalook(round(data[i].cutvalue/1000, 0))+" K"
                    }else if (layout == 2){
                    const c2 = clonerow.getElementsByClassName("c2")[0];
                    c2.style.display = "none";
                    
                    const c3 = clonerow.getElementsByClassName("c3")[0];
                    c3.innerHTML = valutalook(round(data[i].kickbackvalue/1000, 0))+" K"  
                    
                    }else if (layout == 3){
                    const c2 = clonerow.getElementsByClassName("c2")[0];
                    c2.style.display = "none";
                    
                    const c3 = clonerow.getElementsByClassName("c3")[0];
                    c3.innerHTML = valutalook(round(data[i].kickbackvalue/1000, 0))+" K"  
                    
                    }
                list.appendChild(clonerow);
     
                }
    
}

function sortArrayKickback(array){
    if(Array.isArray(array)){
    // sort by name
    var sortarray = array.sort((a, b) => b.kickbackvalue-a.kickbackvalue);
    return sortarray;
    }else{
    return [];
    }
}
    
function loadmaindateSelector(){
        
        let back12mnd = finddateBackIntime(12);
        let today = getTodayInISOFormat();
        let firstdateinyear = getFirstDayOfYear();
        let startdate = "2010-01-01";
        
        var options = [];
        
        let value1 =back12mnd+","+today;
        options.push({text:"Siste 12 mnd.",value:value1});
       
      
        let value2 = firstdateinyear+","+today;
        options.push({text:"Hittil i år",value:value2});
      
        let value3 = startdate+","+today;
        options.push({text:"Fra start",value:value3});
      
        
        loadselector(document.getElementById("dashboarddateselector"),options);
    
}



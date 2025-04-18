var userid = "";

function startApp(){

    document.getElementById("contentscreen").style.display = "none";
    document.getElementById("loadingscreen").style.display = "block";
    
    loadmaindateSelector();
    companySelected();
}

function companySelected(){
    //laste ned alle besparelseslinjene på dette selskapet 
    
    let shareId = getTokenFromURL("shareId");
    let shareKey = getTokenFromURL("shareKey");
    
    getRecordWithShareKeyButton(shareId,shareKey,"respondcustomerlist");
    
    //tømm data ang ansattportal
    clearcompanyDetaljes();
}
    
async function getRecordWithShareKeyButton(shareId,shareKey,id){
        let response = await fetch(`https://expoapi-zeta.vercel.app/api/row?shareId=${shareId}&shareKey=${shareKey}`);
        
         if (!response.ok) {
               if(response.status == 401){
               alert("Linken har utløpt. \nKontakt Kundesenter for å få ny link.")
               }
            }
            
         let data = await response.json();
       apireturn (data,id);
}
      
function getTokenFromURL(key){
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get(key); // Henter verdien av 'id'-parameteren
        return id;
       
}
       
function respondcustomerlist(data,id){
        
        //setter kundenavn
        document.getElementById("customernametext").innerHTML = data.fields.Name;

       // var  companylines = makecompanylines(data);
        
        // Konverter JSON-strenger til objekter
        const jsonStrings = data.fields.cashflowjson;
        let cashflowjson = convertJsonStringsToObjects(jsonStrings);

        companydatalines = cashflowjson;
        mainrootcompanylist(companydatalines);

        let users = [];
        //sjekke om det finner brukere på data.fields.brukerjson
        if(data.fields?.brukerjson){
            users = data.fields.brukerjson;
            users = convertJsonStringsToObjects(users);
        }   

        employerOptunity(users);
        
        
        //vis content
        document.getElementById("contentscreen").style.display = "block";
       
        //skul loader
        document.getElementById("loadingscreen").style.display = "none";

        //er det er gruppeselskap så viser vi knapp for å vise detaljer
        const groupTextInfo = document.getElementById("groupTextInfo");
        groupTextInfo.parentElement.style.display = "none";
        if(data.fields?.groupsumtolink){
            viewGroupData(data.fields);
        }

        //sende beskjed om at denne linken er åpnet
        sendresponsData(data.fields);
}

function viewGroupData(company) {
    let groupname = company.parentcompanyname || "";
    let sum = company.sumgroupsavings || 0;
    const groupTextInfo = document.getElementById("groupTextInfo");

    if (sum > 20000) {
        const formattedSum = `<strong><u>${valutalook(round(sum))} Kr.</u></strong>`;
        groupTextInfo.innerHTML = `Selskapet er en del av gruppen ${groupname}.<br>Gruppen har samlet besparelse ${formattedSum} de siste 12 mnd.`;
        groupTextInfo.parentElement.style.display = "block";
    } else {
        groupTextInfo.parentElement.style.display = "none";
    }
}



function employerOptunity(data){
    
    //filtrer ut un de brukerne som har rolle = "ansatt"
    let ansattbrukere = [];
   
    for(var i = 0;i<data.length;i++){
        if(data[i].rolle == "ansatt"){
            ansattbrukere.push(data[i]);
        }
    }

    //hvis dette er ingen så skule brukerliste
    const messagecompanydetalj = document.getElementById("messagecompanydetalj");
    const companydetailswrapper = document.getElementById("companydetailswrapper");
    if(ansattbrukere.length < 3){
        companydetailswrapper.style.display = "none"; 
        messagecompanydetalj.innerHTML = "";
    }else{
        companydetailswrapper.style.display = "block"; 
        //vis teksten
        messagecompanydetalj.innerHTML = document.getElementById("customernametext").innerHTML + 
    " har " + ansattbrukere.length + 
    " stk. ansatte som bruker innkjøpsGRUPPEN sine private avtaler.<br>Å ha fornøyde ansatte er svært økonomisk og vi er glade for at vi kan være med å bidra.";

    }

}

function sendresponsData(data) {
    try {
        let body = {
            link: window.location.href,
            device: getDeviceType(),
            comment: "Link åpnet" 
        };

        // Legg til company som array hvis den eksisterer
        if (data.airtable) {
            body.company = [data.airtable];
        }

        // Bruk global `userid` hvis definert, ellers legg til en kommentar
        if (typeof userid !== "undefined" && userid) {
            body.user = [userid]; // User lagres som en array
        } else {
            body.comment = "Link åpnet - Bruker ikke innlogget";
        }

        sendDataToZapierWebhook(body, "https://hooks.zapier.com/hooks/catch/10455257/2ggc5vw/", "responsDataLink");
        console.log("Data sendt til Zapier:", body);
    } catch (error) {
        console.error("Feil ved sending av responsdata:", error);
    }
}

async function sendDataToZapierWebhook(data,url,id) {
    
    const formData = new FormData();
    for (const key in data) {
        const value = data[key];
        // Sjekk om verdien er en array eller objekt og stringify hvis nødvendig
        formData.append(key, Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : value);
    }
  
    const response = await fetch(url, {
        method: "POST",
        body: formData
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }else{
    let data = await response.json();
    responsDataLink();
    }
}

function responsDataLink(){
    console.log("Data sent");
}

function getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) {
        return "Mobile";
    } else if (width < 1024) {
        return "Tablet";
    } else {
        return "Desktop";
    }
}

console.log(getDeviceType()); // F.eks. "Mobile", "Tablet" eller "Desktop"
 
function makecompanylines(data){
    
    var valuearray = data.fields.valuecashflow;
    var cutvaluearray = data.fields.cutvaluecashflow;
    var suppliernamearray = data.fields.suppliername;
    var type = data.fields.cashflowtype;
    var mark = data.fields.cashflowmark;
    var maindate = data.fields.maindate;
    var seconddate = data.fields.seconddate;
    
    var airtable = data.fields.cashflow;
    var bistandvaluearray = data.fields.bistandvaluecashflow;
    var analysevaluearray = data.fields.analysevaluecashflow;
    var repeatingarray = data.fields.repeating;
    
    var newarray = [];
    
    
    
    for(var i = 0;i<suppliernamearray.length;i++){
    newarray.push({
        mark:mark[i],
        airtable:airtable[i],
        type:type[i],
        maindate:maindate[i],
        date:maindate[i],
        seconddate:seconddate[i],
        value:valuearray[i],
        cutvalue:cutvaluearray[i],
        suppliername:suppliernamearray[i],
        customer:data.fields.Name,
        bistandvalue:bistandvaluearray[i],
        analysevalue:analysevaluearray[i]
        });
    }
    
    return newarray;
    
}

function mainrootcompanylist(data){
        
     //filtrere på valgt dato i velger
    const selector = document.getElementById("dashboarddateselector");
    var datoarray = periodArrayCleaner("maindate","seconddate",selector,data);  

    let groupCahflow = groupSuppliersCashflow(datoarray);
    
     let sum1 = listcompanyinview(groupCahflow);
     //liste opp bistand
      let sum2 = listcompanybistand(findObjectsProperty("type","bistand",datoarray));
     //lister opp analyse
      let sum3 = listcompanyanalyse(findObjectsProperty("type","analyse",datoarray));
      document.getElementById("sumtotalb").innerHTML = valutalook(round(sum1+sum2+sum3))+" Kr";
      document.getElementById("sumtotalb").style.display = "inline-block";
      
    // Hent valgt indeks
        let selectedIndex = selector.selectedIndex;
        // Hent valgt option
        let selectedOption = selector.options[selectedIndex];
        let tekstutenPunktum = selectedOption.text.replace('.', '');
      document.getElementById("periodetextviewer").innerHTML = tekstutenPunktum.toLowerCase()+".";
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

function convertJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
        try {
           
           // Parse hoved JSON-streng til et objekt
           const data = JSON.parse(jsonString);

            //hvis repating står med trekstform TRU eller FALSE så endre til bool
            if(data.repeating == "TRUE"){
                data.repeating = true;
            }
            if(data.repeating == "FALSE"){
                data.repeating = false;
            }


            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}
function groupSuppliersCashflow(data) {
    if (!Array.isArray(data) || data.length === 0) return data;
  
    const grouped = [];
  
    const getValue = v => Array.isArray(v) ? v[0] : v;
  
    data.forEach(item => {
      if (item.type !== "handel") return;
  
      const supplier = getValue(item.supplier);
      const unit = getValue(item.quantityunit);
  
      const key = `${supplier}__${unit}`;
      const existing = grouped.find(g => g._key === key);
  
      const itemQuantity = isNaN(Number(item.quantity)) ? 0 : Number(item.quantity);
  
      if (existing) {
        existing.value += Number(item.value);
        existing.cut += Number(item.cut);
        existing.quantity = (existing.quantity || 0) + itemQuantity;
        existing.lines += 1;
        existing.dataline.push(item);
      } else {
        const first = {
          ...item,
          _key: key,
          supplier: supplier,
          quantityunit: unit,
          value: Number(item.value),
          cut: Number(item.cut),
          quantity: itemQuantity,
          lines: 1,
          dataline: [item]
        };
        grouped.push(first);
      }
    });
  
    // Sorter på leverandørnavn (supplier)
    grouped.sort((a, b) => {
      const nameA = String(a.supplier).toLowerCase();
      const nameB = String(b.supplier).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  
    // Fjern intern nøkkel i retur
    return grouped.map(({ _key, ...rest }) => rest);
  }
  

function mergesuppiersCachflow(data){
 
    if(data){
        var mergearray = [];
        for (var i = 0;i<data.length;i++){
            //finne leverandørlinjen i mergearray
            var object = findObjectProperty("supplier",data[i].supplier,mergearray);
         
            if(object){
                //leverandør funnet med "samme navn" og er lagt til i mergearray tidligere
                    //samme cut
                     object.value = Number(object.value)+Number(data[i].value);
                     object.cut = Number(object.cut)+Number(data[i].cut);
                     //legge til en linje
                     object.lines = Number(object.lines)+1;
    
            }else{
                    let newLine = {supplier:data[i].supplier,value:data[i].value,cut:data[i].cut,datalines:1,airtable:data[i].airtable};
                    if(data[i]?.quantityname){
                            newLine.quantityname = data[i].quantityname;
                            newLine.quantityunit = data[i].quantityunit;
                  }
                  mergearray.push(newLine);
                //denne linjeb har localcut
               // mergearray.push({suppliername:data[i].suppliername,value:data[i].value,cutvalue:data[i].cutvalue,datalines:1,airtable:data[i].airtable});
                
            }
            
        }
    return sortArrayABC("supplier",mergearray);
    }else{
    return data;    
        
    }
    
}


  

function listElements(data,list,type){

    removeAllChildNodes(list);
    var name = "handel";
    
    if(type === 2 || type === 3){
        name = "bistand";
    }
    
    
    const previewlistholder = document.getElementById("previewlistelementholder");
    const noderow = previewlistholder.getElementsByClassName(name)[0];
        
    var gvalue = 0;
    var gcut = 0;
    var bvalue = 0;
    var avalue = 0;
    
        
        for(var i = 0;i<data.length;i++){
        
              const clonerow = noderow.cloneNode(true);
                    clonerow.classList.remove("mal");
                    clonerow.classList.add("copy")
                    clonerow.dataset.index = i;
                    
                    
                    //felles
                    const c1 = clonerow.getElementsByClassName("c1")[0];
                    c1.textContent = data[i]?.suppliertext || data[i]?.supplier || "-";
                    
                    if(type == 1){
                        const c2 = clonerow.getElementsByClassName("c2")[0];
                        
                        if(data[i]?.quantity>0){
                            let quantityname = data[i].quantityname || "";
                            //sjekke om det er Diesel eller Bensin, skriv da Drivstoff
                            if(quantityname == "Diesel" || quantityname == "Bensin"){
                                quantityname = "Drivstoff";
                            }

                            let quantityunit = data[i].quantityunit;
                            if(quantityunit == "Liter"){
                                quantityunit = "L";
                            }
                            
                            if (data[i].quantity > 1999) {
                                const quantityInK = (Number(data[i].quantity) / 1000).toLocaleString("nb-NO", {
                                  minimumFractionDigits: 1,
                                  maximumFractionDigits: 1
                                });
                              
                                c2.textContent = `${quantityInK}K ${quantityunit} ${quantityname}`;
                              } else {
                                c2.textContent = `${Number(data[i].quantity).toLocaleString("nb-NO")} ${quantityunit} ${quantityname}`;
                            }

                        }else{
                          var xvalue = 0;
                          if(data[i]?.value){
                             xvalue = data[i].value;
                          }
                          c2.innerHTML = valutalook(round(xvalue, 0))+" Kr"
                          gvalue = gvalue+Number(xvalue);
                        }
                       
                        const c4 = clonerow.getElementsByClassName("c4")[0];
                        let besparelse = data[i].cut;
                        c4.innerHTML = valutalook(round(besparelse))+" Kr";
                        gcut = gcut+Number(besparelse);
                        
                        if(besparelse == 0){
                        //skul row
                        clonerow.style.display = "none";
                        }
                        
                    }else if (type === 2 || type === 3){
                        const dateelement = clonerow.getElementsByClassName("date")[0];
                        //var date = maindate;
                        dateelement.innerHTML = "";//dayAndmndName(date);
                        //
                        const noteelement = clonerow.getElementsByClassName("note")[0];
                        var mark = "";
                            if(data[i]?.mark){
                                mark = data[i].mark;
                            }
                        noteelement.innerHTML = mark;
                        if(mark == "-"){
                        noteelement.style.display = "none";
                        }
                        
                        
                        //
                        const bvalueelement = clonerow.getElementsByClassName("bvalue")[0];
                        if(type == 2){
                            var bistandvalue = 0;
                            if(data[i]?.bistand){
                                bistand = data[i].bistand;
                                bvalue = bvalue+Number(bistand);
                            }
                        bvalueelement.innerHTML = valutalook(round(bistand, 0))+" Kr"
                        
                        if(bistand == 0){
                        //skul row
                        clonerow.style.display = "none";
                        }
                        
                        
                        }else if(type == 3){
                            var analysevalue = 0;
                            if(data[i]?.analyse){
                                analyse = data[i].analyse;
                                avalue = avalue+Number(analyse);
                            }
                        bvalueelement.innerHTML = valutalook(round(analyse, 0))+" Kr"  
                        
                           if(analyse == 0){
                          //skul row
                          clonerow.style.display = "none";
                          }
                        }
                        //
                    }
                    
                    
                list.appendChild(clonerow);
                }
            
       return {sumvalue:gvalue,sumcutvalue:gcut,sumbvalue:bvalue,sumavalue:avalue};         
}

function listcompanyinview(data){

    const list = document.getElementById("listcopyholder");
    var sumObject = listElements(data,list,1);
    //oppdatere sum
    document.getElementById("gvalue").innerHTML = "";
    //valutalook(round(sumObject.sumvalue))+" Kr";
    document.getElementById("gcut").innerHTML = valutalook(round(sumObject.sumcutvalue))+" Kr";
    if(!data){
    list.parentElement.style.display = "none";
    }
    
    return sumObject.sumcutvalue;
    
    
}
    
function listcompanybistand(data){
    const list = document.getElementById("listholderbistand");
    var sumObject = listElements(data,list,2);
    //oppdatere sum
    document.getElementById("sumbistandtext").innerHTML = valutalook(round(sumObject.sumbvalue))+" Kr";
    if(!data){
    list.parentElement.style.display = "none";
    }
    
    return sumObject.sumbvalue;
}

function listcompanyanalyse(data){
    const list = document.getElementById("listholderanalyse");
    var sumObject = listElements(data,list,3);
    //oppdatere sum
    document.getElementById("sumanalysetext").innerHTML = valutalook(round(sumObject.sumavalue))+" Kr";
    if(!data){
    list.parentElement.style.display = "none";
    }
    
    return sumObject.sumavalue;
}
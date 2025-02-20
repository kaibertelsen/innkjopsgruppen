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
        
        
        //laste ned alle besparelseslinjene på dette selskapet  
         var  companylines = makecompanylines(data);
        companydatalines = companylines;

        // Konverter JSON-strenger til objekter
        const jsonStrings = data.fields.cashflowjson;
        let cashflowjson = convertJsonStringsToObjects(jsonStrings);

        mainrootcompanylist(companydatalines);
        ansattefordeler(data);
        
        //vis content
        document.getElementById("contentscreen").style.display = "block";
       
        //skul loader
         document.getElementById("loadingscreen").style.display = "none";
}
    
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
        
        
     let sum1 = listcompanyinview(mergesuppiersCachflow(findObjectsProperty("type","handel",datoarray)));
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

function convertJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
        try {
           
           // Parse hoved JSON-streng til et objekt
           const data = JSON.parse(jsonString);
           if (!data.cashflowjson) {
               data.cashflowjson = [];
           } 

           if (!data.bruker) {
               data.bruker = [];
           }

           if (!data.invitasjon) {
               data.invitasjon = [];
           }

           if (!data.connections) {
               data.connections = [];
           } 

            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}
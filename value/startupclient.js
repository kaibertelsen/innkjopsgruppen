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
        

        // Konverter JSON-strenger til objekter
        const jsonStrings = data.fields.cashflowjson;
        let cashflowjson = convertJsonStringsToObjects(jsonStrings);

        companydatalines = cashflowjson;
        mainrootcompanylist(companydatalines);

        //ansattefordeler(data);
        
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
            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}

/*
//fra orginalen
{
    "mark": "-",
    "airtable": "recUnfxCWY7yl0EBA",
    "type": "handel",
    "maindate": "2024-12-31",
    "date": "2024-12-31",
    "seconddate": "2024-12-31",
    "value": 26313.53,
    "cutvalue": 2631.353,
    "suppliername": "UnoX",
    "customer": "Viken Betong AS",
    "bistandvalue": 0,
    "analysevalue": 0
}

//fra json
{
    "kickbackvalue": "1052.5412",
    "value": "26313.53",
    "type": "handel",
    "mark": "",
    "airtable": "recUnfxCWY7yl0EBA",
    "customer": "Viken Betong AS",
    "supplier": "UnoX",
    "group": "recU4I3Q8PsPKg2or",
    "groupname": "Bygg og Anlegg",
    "cut": "2631.353",
    "bistand": "0",
    "analyse": "0",
    "maindate": "2024-12-31T00:00:00.000Z"
}
*/
function mergesuppiersCachflow(data){
 
    if(data){
        var mergearray = [];
        for (var i = 0;i<data.length;i++){
            //denne skal kun slå sammen handelstyper
         
            var object = findObjectProperty("supplier",data[i].supplier,mergearray);
         
            if(object){
                //objecter funnet med "samme navn"
                    //samme cut
                     object.value = Number(object.value)+Number(data[i].value);
                     object.cut = Number(object.cut)+Number(data[i].cut);
                     //legge til en linje
                     object.lines = Number(object.lines)+1;
    
            }else{
                    let newLine = {supplier:data[i].supplier,value:data[i].value,cut:data[i].cut,datalines:1,airtable:data[i].airtable};
                    if(data[i]?.supplierquantityname){
                            newLine.quantityname = data[i].supplierquantityname[0];
                            newLine.quantityunit = data[i].supplierquantityunit[0];
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
                    c1.textContent = data[i].supplier;
                   
                    if(type == 1){
                        const c2 = clonerow.getElementsByClassName("c2")[0];
                        
                        if(data[i]?.quantityname){
                        c2.textContent = data[i].value.toLocaleString("nb-NO") + " " + data[i].quantityunit+" "+data[i].quantityname;
                        
                        }else{
                          var xvalue = 0;
                          if(data[i]?.value){
                             xvalue = data[i].value;
                          }
                          c2.innerHTML = valutalook(round(xvalue, 0))+" Kr"
                          gvalue = gvalue+xvalue;
                        }
                       
                        
                        const c4 = clonerow.getElementsByClassName("c4")[0];
                        let besparelse = data[i].cut;
                        c4.innerHTML = valutalook(round(besparelse))+" Kr";
                        gcut = gcut+besparelse;
                        
                        if(besparelse == 0){
                        //skul row
                        clonerow.style.display = "none";
                        }
                        
                    }else if (type === 2 || type === 3){
                        const dateelement = clonerow.getElementsByClassName("date")[0];
                        var date = maindate;
                        dateelement.innerHTML = dayAndmndName(date);
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
                                bvalue = bvalue+bistand;
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
                                avalue = avalue+analyse;
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
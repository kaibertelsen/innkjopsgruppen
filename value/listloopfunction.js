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

        if(data[i]?.suppliertext){
            c1.innerHTML = data[i].suppliertext;
           }else{
            c1.innerHTML = data[i].suppliername;
        
        }
        if(type == 1){
            const c2 = clonerow.getElementsByClassName("c2")[0];
            var xvalue = 0;
            if(data[i]?.value){
                xvalue = data[i].value;
            }
            c2.innerHTML = valutalook(round(xvalue, 0))+" Kr"
            gvalue = gvalue+xvalue;
            
            const c3 = clonerow.getElementsByClassName("c3")[0];
            var xcut = 0;
            if(data[i]?.cut){
                xcut = data[i].cut;
            }
            c3.innerHTML = round(Number(xcut)*100, 2)+"%";
            
            const c4 = clonerow.getElementsByClassName("c4")[0];
            let besparelse = xcut*xvalue;
            c4.innerHTML = valutalook(round(besparelse))+" Kr";
            gcut = gcut+besparelse;
                        
        }else if (type === 2 || type === 3){
            const dateelement = clonerow.getElementsByClassName("date")[0];
            var date = "";
            if(data[i]?.date){
                date =  data[i].date;
            }else if(data[i]?.periodeend){
                date = data[i].periodeend;
            }
            dateelement.innerHTML = date;
            //
            const noteelement = clonerow.getElementsByClassName("note")[0];
            var mark = "";
            if(data[i]?.mark){
                    mark = data[i].mark;
            }
            noteelement.innerHTML = mark;
            //
            const bvalueelement = clonerow.getElementsByClassName("bvalue")[0];
            if(type == 2){
                var bistandvalue = 0;
                if(data[i]?.bistandvalue){
                    bistandvalue = data[i].bistandvalue;
                    bvalue = bvalue+bistandvalue;
                }
                bvalueelement.innerHTML = valutalook(round(bistandvalue, 0))+" Kr"
            }else if(type == 3){
                var analysevalue = 0;
                if(data[i]?.analysevalue){
                    analysevalue = data[i].analysevalue;
                    avalue = avalue+analysevalue;
                }
                bvalueelement.innerHTML = valutalook(round(analysevalue, 0))+" Kr"  
            }
            //
        }
                    
        const buttonline = clonerow.getElementsByClassName("buttonline")[0];
        buttonline.innerHTML = data[i].lines;
        const suppliername = data[i].suppliername;
        const constantcut = data[i].cut;
        
        const editline = clonerow.getElementsByClassName("editline")[0];
        const dataid = data[i].airtable;
        const findid = dataid+"find";
    
        if(data[i].lines>1){
            clonerow.id = data[i].airtable+"lines";
            //det er flere linjer
            buttonline.style.display = "flex"; 
            buttonline.id = findid;
            buttonline.onclick = function() {
            findLines(suppliername,dataid,clonerow.id,constantcut);
            };
            editline.style.display = "none"; 
        }else{
            clonerow.id = data[i].airtable+"edit";
            buttonline.style.display = "none"; 
            //det er bare en linje og kan kjøre editknapp direkte på linjen
            editline.style.display = "flex"; 
            editline.onclick = function() {
            editLine(dataid,clonerow.id,"directedit");
            }; 
        }
                    
                    
        list.appendChild(clonerow);
    }
            
    return {sumvalue:gvalue,sumcutvalue:gcut,sumbvalue:bvalue,sumavalue:avalue};         
}
function mergesuppiersCachflow(data){
 
    var mergearray = [];
    
        for (var i = 0;i<data.length;i++){
            //denne skal kun slå sammen handelstyper
         
            var objects = findObjectsProperty("suppliername",data[i].suppliername[0],mergearray);
            let cut;
            if(data[i]?.localcut){
              cut = data[i].localcut;   
            }else if(data[i]?.defaultcut){
              cut = data[i].defaultcut[0];    
            }else{
             cut = 0;   
            }
            
            if(objects){
                //objecter funnet med "samme navn"
                //finne samme cut
                var cutobject = findObjectProperty("cut",cut,objects);
                
                if(cutobject){
                    //samme cut
                     cutobject.value = Number(cutobject.value)+Number(data[i].value);
                     //legge til en linje
                     cutobject.lines = Number(cutobject.lines)+1;
                }else{
                    //ikke samme cut
                    let newLine = {suppliername:data[i].suppliername[0],value:data[i].value,cut:cut,lines:1,airtable:data[i].airtable};

                    if(data[i]?.supplierquantityname[0]){
                        newLine.quantityname = data[i].supplierquantityname[0];
                    }
                    mergearray.push(newLine);
                }
      
                
            }else{
                let newLine = {suppliername:data[i].suppliername[0],value:data[i].value,cut:cut,lines:1,airtable:data[i].airtable};
                if(data[i]?.supplierquantityname[0]){
                    newLine.quantityname = data[i].supplierquantityname[0];
                }
                //denne linjeb har localcut
                mergearray.push(newLine);
            }
            
        }
    return sortArrayABC("suppliername",mergearray);
    }
{
    "nr": 19411,
    "airtable": "rec6v2vc8ZpLE6QJI",
    "value": 1951.069999999999,
    "supplier": [
        "recSW81Klal73BRHv"
    ],
    "customer": [
        "rec6jAr1tU9rDw32i"
    ],
    "import": [
        "recntB5z5MtHDydt1"
    ],
    "periodeend": [
        "2025-01-31"
    ],
    "periodestart": [
        "2025-01-01"
    ],
    "importname": [
        "VolumInnkjpsgruppen12025.xlsx"
    ],
    "customername": [
        "Viken Betong AS"
    ],
    "tracking": "webimporter",
    "rowindex": 5,
    "defaultcut": [
        0.01
    ],
    "dachboard": [
        "recfJZ0PCPOrWcBLq"
    ],
    "customerid": [
        "rec6jAr1tU9rDw32i"
    ],
    "suppliername": [
        "UnoX"
    ],
    "cutvalue": 195.1069999999999,
    "type": "handel",
    "Last Modified": "2025-02-06T13:47:22.000Z",
    "analysevalue": 0,
    "bistandvalue": 0,
    "kickback": [
        0.05
    ],
    "kickbackvalue": 78.04279999999996,
    "maindate": [
        "2025-01-31"
    ],
    "seconddate": [
        "2025-01-31"
    ],
    "optionname": [
        "UnoX"
    ],
    "supplierid": [
        "recSW81Klal73BRHv"
    ],
    "cleansupplierid": [
        "recSW81Klal73BRHv"
    ],
    "cleanmark": "-",
    "customergroup": [
        "recU4I3Q8PsPKg2or"
    ],
    "customergroupname": [
        "Bygg og Anlegg"
    ],
    "quantity": 1951.069999999999,
    "supplierquantity": [
        "recxZnfBl6xY8EUXQ"
    ],
    "supplierkickbackperquantity": [
        0.04
    ],
    "suppliersavingsperquantity": [
        0.1
    ],
    "json": "{\"kickbackvalue\": \"78.04279999999996\",\"value\": \"1951.069999999999\",\"airtable\": \"rec6v2vc8ZpLE6QJI\",\"customer\": \"Viken Betong AS\",\"supplier\": \"UnoX\",\"group\": \"recU4I3Q8PsPKg2or\",\"groupname\": \"Bygg og Anlegg\",\"cut\": \"195.1069999999999\",\"bistand\": \"0\",\"analyse\": \"0\",\"maindate\": \"2025-01-31T00:00:00.000Z\"}"
}
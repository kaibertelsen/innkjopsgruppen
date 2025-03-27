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

        c1.innerHTML = data[i]?.suppliertext || data[i]?.suppliername || "-";

        if(type == 1){
            const c2 = clonerow.getElementsByClassName("c2")[0];
            const c3 = clonerow.getElementsByClassName("c3")[0];
      
            if(data[i]?.quantity>0){
                //dette er en volum enhet og ikke kroner
                let quantityname = data[i].supplierquantityname || "";
                    //sjekke om det er Diesel eller Bensin, skriv da Drivstoff
                    if(quantityname == "Diesel" || quantityname == "Bensin"){
                        quantityname = "Drivstoff";
                    }
                //dette er en volum enhet og ikke kroner
                let quantityunitLable = data[i].supplierquantityunit;
                if (data[i].supplierquantityunit == "Liter"){
                    //forkortelse til "L"
                    quantityunitLable = "L";
                }

                //skal en vise K eller ikke
                if(data[i]?.quantity>1999){
                    c2.textContent = (Number(data[i].value)/1000).toLocaleString("nb-NO") + "K " + quantityunitLable+" "+quantityname;
                }else{
                c2.textContent = data[i].value.toLocaleString("nb-NO") + " " + quantityunitLable+" "+quantityname;
                }
                //besparelse pr enhet
                let localsavingsperquantity = data[i].localsavingsperquantity || 0;
                let lable = "";

                //må finne ut om det er best å hvise øre eller krone
                if(data[i]?.supplierquantityunit == "Liter"){
                    //vis øre
                    localsavingsperquantity = localsavingsperquantity*100;
                    lable = valutalook(round(localsavingsperquantity, 0))+"øre/L";
                }else{
                    //vis krone
                    lable = valutalook(round(localsavingsperquantity, 2))+" Kr/"+quantityunitLable;
                }
                c3.textContent = lable;
                
                //(Number(data[i].cutvalue) / Number(data[i].value)).toFixed(1) + " Kr/pr. " + data[i].quantityunit;
            }else{
                var xvalue = 0;
                if(data[i]?.value){
                    xvalue = data[i].value;
                }
                c2.innerHTML = valutalook(round(xvalue, 0))+" Kr"
                gvalue = gvalue+xvalue;

                var xcut = data[i]?.localcut || data[i]?.defaultcut || 0;
                c3.innerHTML = round(Number(xcut)*100, 2)+"%";
            }

            const c4 = clonerow.getElementsByClassName("c4")[0];
            let besparelse = data[i].cutvalue || 0;
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

                if(clientMode){
                    if(analysevalue == 0){
                        //skul row
                        clonerow.style.display = "none";
                    }
                }

            }
            //
        }
        if(!clientMode){ 
        const buttonline = clonerow.querySelector(".buttonline");
        buttonline.innerHTML = data[i].lines;
     
        const editline = clonerow.querySelector(".editline");
        const dataid = data[i].airtable;
        const findid = dataid+"find";
    
        if(data[i]?.lines>1){
            clonerow.id = data[i].airtable+"lines";
            //det er flere linjer
            buttonline.style.display = "flex"; 
            buttonline.id = findid;
            let dataBlock = data[i];
            buttonline.onclick = () => {
                findLines(dataBlock, clonerow);
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
                    
    }         
        list.appendChild(clonerow);
    }
            
    return {sumvalue:gvalue,sumcutvalue:gcut,sumbvalue:bvalue,sumavalue:avalue};         
}

function groupSuppliersCashflow(data) {
    if (!Array.isArray(data) || data.length === 0) return data;
  
    const grouped = [];
  
    const getValue = v => Array.isArray(v) ? v[0] : v;
  
    data.forEach(item => {
      if (item.type !== "handel") return;
  
      const supplier = getValue(item.supplier);
      const defaultcut = getValue(item.defaultcut);
      const unit = getValue(item.supplierquantityunit);
      const localcut = getValue(item.localcut);
  
      const key = `${supplier}__${defaultcut}__${unit}__${localcut}`;
  
      const existing = grouped.find(g => g._key === key);
  
      if (existing) {
        existing.value += Number(item.value);
        existing.cutvalue += Number(item.cutvalue);
        existing.lines += 1;
        existing.dataline.push(item); // legg til original linje
      } else {
        const first = {
          ...item,
          _key: key,
          value: Number(item.value),
          cutvalue: Number(item.cutvalue),
          lines: 1,
          dataline: [item] // start med én linje
        };
        grouped.push(first);
      }
    });
  
    return grouped.map(({ _key, ...rest }) => rest);
}
  
function findLines(data,element){

    let subviewlist = element.querySelector(".subviewlist");
    //sjekk om denne er synlig eller ikke toogle den
    if(subviewlist.style.display == "block"){
        removeAllChildNodes(subviewlist);
        subviewlist.style.display = "none";
    } else{
        subviewlist.style.display = "block";
        let dataLine = data.dataline;
        listElements(dataLine,subviewlist,1);
    }

}

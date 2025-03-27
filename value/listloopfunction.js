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
        buttonline.innerHTML = data[i].lines || "";
     
        const buttoneditline = clonerow.querySelector(".editline");
        const dataid = data[i].airtable;
        const findid = dataid+"find";
        let dataBlock = data[i];
    
        if(data[i]?.lines>1){
            clonerow.id = data[i].airtable+"lines";
            //det er flere linjer
            buttonline.style.display = "flex"; 
            buttonline.id = findid;
            buttonline.onclick = () => {
                findLines(dataBlock, clonerow);
            };

            buttoneditline.style.display = "none"; 
        }else{
            clonerow.id = data[i].airtable+"edit";
            buttonline.style.display = "none"; 
            //det er bare en linje og kan kjøre editknapp direkte på linjen
            buttoneditline.style.display = "flex"; 
            buttoneditline.onclick = () => {
                editRowLine(dataBlock, clonerow);
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

function editRowLine(data,rowelement){
        
    const element = document.getElementById("editornewwrapper");

    if(element.dataset?.hideobject){
        if(document.getElementById(element.dataset.hideobject)){
        //synligjør tidligere skjult element
        document.getElementById(element.dataset.hideobject).style.display = "grid";
        }
    }
    
    loadEditwrapper(data);
    insertElementInline(rowelement,element);
    
    //synligjør editbar
    document.getElementById("editornewwrapper").style.display = "block";
    
    //skjuler editlinje
    rowelement.style.display = "none";
    rowelement.id = data.airtable+"edit";
    element.dataset.hideobject = rowelement.id;

}

function cancleEdit(){
    const element = document.getElementById("editornewwrapper");
    if(element.dataset.hideobject){
        //synligjør tidligere skjult element
        const hideobject = document.getElementById(element.dataset.hideobject);
        if(hideobject){
            hideobject.style.display = "grid";
        }
    }
    
    element.style.display = "none";
    //reseteditwrapperinput();
    //ny linjeknappen
    document.getElementById("addnewlinehandelbutton").style.display = "inline-block";
    document.getElementById("addnewlinebistandbutton").style.display = "inline-block";
}
    
function deleteLine(airtable){
    
    DELETEairtable(baseid,"tblkNYRENn5QFG0CD",airtable,"responsdeletevolum");
      
    //synligjør melding
    document.getElementById("savinglinewrapper").style.display = "flex";
    document.getElementById("prosessmessagetext").innerHTML = "Sletter ..."
    
    //skjule data
    document.getElementById("maineditrow").style.display = "none";
    document.getElementById("infoinputwrapper").style.display = "none";
}

function loadEditwrapper(data){

    //velge oppsett
    showhideeditwraper(data.type);
    
    //wrapper
    const element = document.getElementById("editornewwrapper");
    element.dataset.airtable = data.airtable;
    
    const supplierinput = document.getElementById("dropdownInputsupplier");
    supplierinput.value =  data.suppliertext || data.suppliername;
    if(!data?.suppliertext){
        //legge til airtable
        supplierinput.dataset.airtable = data.supplier[0];  
        supplierinput.disabled = true;
    }
     
    if(data.type == "handel"){
        //value
        const mainValue = document.getElementById("valueinput");
        const cutSetting = document.getElementById("cutinput");
        const cutValue = document.getElementById("cutvalueinput");

        if(data?.quantity>0){
            //dette er en volum enhet og ikke kroner
            let quantityname = data.supplierquantityname || "";
                //sjekke om det er Diesel eller Bensin, skriv da Drivstoff
                if(quantityname == "Diesel" || quantityname == "Bensin"){
                    quantityname = "Drivstoff";
                }
            //dette er en volum enhet og ikke kroner
            let quantityunitLable = data.supplierquantityunit;
            if (data.supplierquantityunit == "Liter"){
                //forkortelse til "L"
                quantityunitLable = "L";
            }
            
            mainValue.value = data[i].quantity.toLocaleString("nb-NO") + " " + quantityunitLable+" "+quantityname;
            
            
            //besparelse pr enhet
            let localsavingsperquantity = data.localsavingsperquantity || 0;
            let lable = "";

            //må finne ut om det er best å hvise øre eller krone
            if(data?.supplierquantityunit == "Liter"){
                //vis øre
                localsavingsperquantity = localsavingsperquantity*100;
                lable = valutalook(round(localsavingsperquantity, 0))+"øre/L";
            }else{
                //vis krone
                lable = valutalook(round(localsavingsperquantity, 2))+" Kr/"+quantityunitLable;
            }
            cutSetting.value = lable;
        
        }else {
            //da er det kroner
            mainValue.value = valutalook(round(data.value, 0))+" Kr";

            let cutSettingNumber = data.localcut || data.defaultcut || 0;
            cutSetting.value = round(Number(cutSettingNumber)*100, 2)+"%";

        }
        //cutvalue
        let besparelse = data.cutvalue || 0;
        cutValue.value = valutalook(round(besparelse))+" Kr";
    
    }else if (data.type == "bistand"){
      //mark
            var mark = "";
            if(data?.mark){
             mark = data.mark; 
            }
      document.getElementById("markinput").value = mark;
      document.getElementById("bvalueinput").value = valutalook(round(data.bistandvalue,0))+" Kr";
    }else if (data.type == "analyse"){
      //mark
            var mark = "";
            if(data?.mark){
             mark = data.mark; 
            }
      document.getElementById("markinput").value = mark;
      document.getElementById("avalueinput").value = valutalook(round(data.analysevalue,0))+" Kr";
    }
     
     
     
    //datevolum
    var date = "";
                    if(data?.date){
                    date =  data.date;
                    }else if(data?.periodeend){
                    date = data.periodeend;
                    }
     document.getElementById("datevolum").value = date;
     //note
     var note = "";
     if(data?.note){
        note = data.note; 
     }
     document.getElementById("notataddvolum").value = note;
     //delete
     document.getElementById("deleteeditbutton").style.display = "inline-block";
     document.getElementById("deleteeditbutton").onclick = function() {
                    deleteLine(data.airtable);
                        };
}
     
function reseteditwrapperinput(){
    document.getElementById("savinglinewrapper").style.display = "none";
    document.getElementById("listcopyholderlines").style.display = "none";
    document.getElementById("deleteeditbutton").style.display = "none";
    document.getElementById("maineditrow").style.display = "grid";
    document.getElementById('editfunctionbutton').dataset.count = "0";
    const element = document.getElementById("editornewwrapper");
     element.removeAttribute('data-airtable');
    document.getElementById("datevolum").value = makeToDaytring(); 
    document.getElementById("valueinput").value = "10 000 Kr";
    document.getElementById("cutinput").value = "10.00 %";
    document.getElementById("cutinput").style.color = 'black';
    document.getElementById("cutvalueinput").innerHTML = "1000 Kr";
    document.getElementById("dropdownInputsupplier").value = "";
    document.getElementById("dropdownInputsupplier").removeAttribute('data-airtable');
    document.getElementById("notataddvolum").value = "";
    document.getElementById("markinput").value = "";
    document.getElementById("markinput").placeholder = "Merk ...";
    document.getElementById("bvalueinput").value = "5000 Kr";
    //flytter editorwrapper vekk fra list element
    document.getElementById("listparrentholder").appendChild(document.getElementById("editornewwrapper"));
    //flytte multilineswrapper ut fra list element
    document.getElementById("listparrentholder").appendChild(document.getElementById("listcopyholderlines"));
    
    //ny linjeknappen
    document.getElementById("addnewlinehandelbutton").style.display = "inline-block";
    document.getElementById("addnewlinebistandbutton").style.display = "inline-block";
    document.getElementById("addnewlineanalysebutton").style.display = "inline-block";
}

function makeeditfunction(state){
        
        const editbuttons = document.getElementsByClassName("editwrapper");
        
        for(var i = 0;i<editbuttons.length;i++){
            if(state){
            editbuttons[i].style.display = "flex";
            }else{
            editbuttons[i].style.display = "none";  
            }
        }
        
}
    
function showhideeditwraper(type){
    document.getElementById("editornewwrapper").dataset.type = type;
    
    if(type == "handel"){
        document.getElementById("dropdownInputsupplier").style.display = "block";
        document.getElementById("valueinput").style.display = "block";
        document.getElementById("cutinput").style.display = "block";
        document.getElementById("cutvalueinput").style.display = "block";
        document.getElementById("datevolum").style.display = "block";
    
        document.getElementById("markinput").style.display = "none";
        document.getElementById("bvalueinput").style.display = "none";
        document.getElementById("avalueinput").style.display = "none";
        
    }else if(type == "bistand"){
        document.getElementById("dropdownInputsupplier").style.display = "block";
        document.getElementById("markinput").style.display = "block";
        document.getElementById("bvalueinput").style.display = "block";
        document.getElementById("datevolum").style.display = "block";
        
        document.getElementById("valueinput").style.display = "none";
        document.getElementById("cutinput").style.display = "none";
        document.getElementById("cutvalueinput").style.display = "none"; 
        document.getElementById("avalueinput").style.display = "none";
        
    }else if(type == "analyse"){
        document.getElementById("dropdownInputsupplier").style.display = "block";
        document.getElementById("markinput").style.display = "block";
        document.getElementById("avalueinput").style.display = "block";
        document.getElementById("datevolum").style.display = "block";
        
        document.getElementById("bvalueinput").style.display = "none";
        document.getElementById("valueinput").style.display = "none";
        document.getElementById("cutinput").style.display = "none";
        document.getElementById("cutvalueinput").style.display = "none"; 
        
    }
    
    
}

function supplierSelected(id,name,cut){
    
    //sette hele navnet inn
    const input = document.getElementById("dropdownInputsupplier");
    input.value = name;
    input.dataset.airtable = id;

    // Finn eventuell eksisterende besparelsesfaktor for denne kunde på denne leverandøren
    const match = SelectedCompanyInFirstTab.cutsettings.find(item => item.supplier === id);

    if (match) {
        //kunden har en satt rabatt hos denne leverandøren benytt denne
        document.getElementById("cutinput").value = (match.cut)+"%";
        //sett fargen til grønn
        document.getElementById("cutinput").style.color = 'green';
    } else if (cut) {
        //kunden har ikke en satt rabatt hos denne leverandøren
            document.getElementById("cutinput").value = (cut*100)+"%"
            document.getElementById("cutinput").style.color = '#B8860B';
    }else{
        //verken kunden eller leverandøren har en standard verdi
            document.getElementById("cutinput").style.color = 'black';
    }
    
}

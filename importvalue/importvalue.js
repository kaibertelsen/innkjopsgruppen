var gQuantityUnitName = "";
var qCompanyesFromLastImport = [];
function importcontrolledcompanyes(){


    //sjekke om foundCompany har nye selskap og evt færre selskaper en tidligere
    const okToImport = controllImportCompanys(foundCompany, qCompanyesFromLastImport);

    if (!okToImport) {
    console.log("Import avbrutt av bruker.");
    return;
    }
    //sjekke om supplierid er satt
    if(suplierid == ""){
        alert("Leverandør er ikke satt.");
        return;
    }
    
    if(isValidDate(datestart.value)&&isValidDate(dateend.value)){
    //1
    let mc = JSON.stringify(missingComapny);
    //Registrere en import i airtable
    let body = {
        name:xlsimportfilename,
        periodestart:datestart.value,
        periodeend:dateend.value,
        missingcompanys:mc,
        file: xlsurl,
        user:[userairtableid],
        supplier:[suplierid]
    };
    POSTairtable(baseid,"tblv7x4hyh6Q3v6z0",JSON.stringify(body),"returnsaveimport");
    }else{
    alert("Dato perioden er ikke definert riktig.");
    }
}


function controllImportCompanys(data1, data2) {
    const currentCompanies = new Set(data1.map(c => c.airtable));
    const missingCompanies = data2.filter(oldCompany => !currentCompanies.has(oldCompany.airtable));
  
    if (missingCompanies.length > 0) {
      const message = 
        "Følgende selskaper har tidligere vært med i importen, men mangler i denne:\n\n" +
        missingCompanies.map(c => `• ${c.name} (orgnr: ${c.orgnr || 'ukjent'})`).join('\n') +
        "\n\nVil du fortsette likevel?";
  
      const confirmed = confirm(message); // ❗️Programmet stopper her
      return confirmed; // true = fortsett, false = avbryt
    }
  
    return true; // ingen mangler, alt ok
}
  

function returnsaveimport(data,id){

    sendpacks = 0; 
    importvalue = 0;
    
    linesimport = 0;
    notimportline = howmanylinetoimport();
    
    let importid = data.id;
    //1
    var saveObject = [];
    //Registrere en import i airtable
    for(var i = 0;i<foundCompany.length;i++){
        saveObject.push(makesaveObject(foundCompany[i],importid));
    }


    multisave(saveObject, baseid, "tbly9xd4ho0Z9Mvlv", "returNewMultiImport");
  
    document.getElementById("importstatuswrapper").style.display = "block";
    document.getElementById("aftercontrollelement").style.display = "none";

}


function returNewMultiImport(data){
    console.log(data);

    document.getElementById("missingonimportwrapper").style.display = "block";
    document.getElementById("uploadmore").style.display = "inline-block";
    document.getElementById("loadergiffprosess").style.display = "none";

}

function makesaveObject(data, importid) {
   
    const fields = {
        supplier: [suplierid],
        customer: [data.airtable],
        customernr: data.kundenr,
        import: [importid],
        value: Number(data.value) || 0, // sikrer at det blir et tall, eller 0 hvis ugyldig
        tracking: "webimporter",
        rowindex: data.rowindex,
        note: data.note,
        dachboard: ["recfJZ0PCPOrWcBLq"],
        type: "handel"
    };

     // 👉 Legg til cutsetting hvis kunde har en lokal avtale med denne leverandøren
     const customCut = data.cutsettings?.find(cut => cut.supplier === suplierid);

    if (customCut && customCut.cut != null) {
        //sjekke om det er % eller liter

        if(gQuantityUnitName == "Liter" && customCut.mode == "2"){
            //besparelsesmodus øre/liter
            fields.localsavingsperquantity = Number(customCut.cut)/100;
        }else if(gQuantityUnitName == "m3" && customCut.mode == "3"){
            //besparelsesmodus kr/m3
            fields.localsavingsperquantity = Number(customCut.cut);
        } else if(customCut.mode == "1"){
            //prosent besparelse
            fields.localcut = Number(customCut.cut)/100;
        }  

    }

    if (quantityId !== "") {
        fields.supplierquantity = [quantityId];
    }

    if (data.quantity !== "") {
        fields.quantity = data.quantity;
    }

   

    return fields;
}


function controllcompany(data,row,rooting,irow){

    let orgnrindex = findObjectProperty("index",1,rooting).fileindex;
    let nameindex = findObjectProperty("index",2,rooting).fileindex;
    
    var companyobject
    if(orgnrindex == ""){
        //orgnummer er ikke rootet
        companyobject = findObjectCName("Name",row[nameindex],data);
    }else{
        //orgnummer er rutet søk 
        companyobject = findObjectOrgnr("orgnr",row[orgnrindex],data);
    }

     
     if(!companyobject){
         //02 - finner ikke firma med orgnr i firmalisten prøv med firmanavn
         if(nameindex != ""){
       companyobject = findObjectCName("Name",row[nameindex],data);   
         }
     }

      let noteindex = findObjectProperty("index",3,rooting).fileindex;
      let customernrindex = findObjectProperty("index",0,rooting).fileindex;
      let valueindex = findObjectProperty("index",4,rooting).fileindex;
      let quantityindex = findObjectProperty("index",5,rooting).fileindex;
      
      let name = "";
      let note = "";
      let orgnr = "";
      let kundenr = "";
      let qantity = "";

      if(nameindex != ""){
      name = row[nameindex];  
      }
      if(noteindex != ""){
      note = row[noteindex];  
      }
     
      if(orgnrindex != ""){
      orgnr = row[orgnrindex];
      }
      
      if(customernrindex != ""){
      kundenr = String(row[customernrindex]);
      }
      
      if(quantityindex != ""){
         qantity =  row[quantityindex];
      }
      
      let value = row[valueindex];
      
      const rowElement = document.getElementById("row"+irow); 
      
     if(companyobject){
     // firma funnet - legg til firma i rootinglisten
          
          //marker rad
          rowElement.classList.add("find");
          
          let airtable = companyobject.airtable;
          var cobject = {name:name,quantity:qantity,kundenr:kundenr,orgnr:orgnr,airtable:airtable,note:note,value:value,rowindex:irow};
          
          //hvis companyobject har .cutsettings
            if (companyobject.cutsettings) {
                cobject.cutsettings = companyobject.cutsettings;
            }



          foundCompany.push(cobject);
         
        // Legg til value
                  if (!isNaN(value) && value !== null && value !== "") {
                      foundvalue = Number(foundvalue) + Number(value);
                          } else {
                      foundvalue = Number(foundvalue) + 0;
                          }

         
         if (!(qantity == NaN)) {
         foundquantityvalue = Number(foundquantityvalue)+Number(qantity);
         }
         
      return true;
     }else{
          //fjerner markering på rad
          rowElement.classList.remove("find");
         var cobject = {"name":name,"kundenr":kundenr,"orgnr":orgnr,"note":note,"value":value,rowindex:irow};
         missingComapny.push(cobject);
         if (!isNaN(value) && value !== null && value !== "") {
                  missingvalue = Number(missingvalue) + Number(value);
                      } else {
                      missingvalue = Number(missingvalue) + 0; // Legg til 0 hvis `value` ikke er et nummer
                      }

          return false;
     }
     

 
 
}

function findObjectCName(property,value,array){

    //key,navn fra xls, alle selskapene
    if(Array.isArray(array)){
        for (var i = 0;i<array.length;i++){
            let value1 = onlycnameFromvariable(array[i][property]);
            let valueAlt = onlycnameFromvariable(array[i]["altname"]);
            let value2 = onlycnameFromvariable(value);
            if(value1 == ""||value2 == ""){
            //det mangler info på en eller begge verdier
            }else if(value1 == value2){
            return array[i];
            }else if(valueAlt){
                //inneholder alternativ name
                if(valueAlt == value2){
                return array[i]; 
                }
            }
        }
        return false;
     }   
    return false;
}

function quantityunitSelectorchange(selector) {

        let quantityObject = findObjectProperty("airtable",selector.value,quantityArray);
          let selectedText = quantityObject.name+" ("+quantityObject.unit+")";
          var quantityName = document.getElementById("quantityname");
          quantityName.textContent = selectedText;
          quantityId = selector.value;

          gQuantityUnitName = quantityObject.unit
}

function controlSupplierQuantity(suppliers, supplierid) {
    var supplier = findObjectProperty("airtable", supplierid, suppliers);
  
    
    var quantityWrapper = document.getElementById("quantitywrapper");
    var quantityName = document.getElementById("quantityname");
    var quantityuntiWrapper = document.getElementById("quantityuntiwrapper");
    quantityArray = [];
  
      if (supplier?.quantity) {
        quantityWrapper.style.display = "block";
        quantityName.textContent = supplier.quantityname[0]+" ("+supplier.quantityunit[0]+")";
        quantityId = supplier.quantity[0];
        gQuantityUnitName = supplier.quantityunit[0];
        
         
           for (var i = 0;i<supplier.quantity.length;i++){
           quantityArray.push({
              name:supplier.quantityname[i],
              unit:supplier.quantityunit[i],
              airtable:supplier.quantity[i] 
              });
          }
  
  
          if(supplier.quantity.length>1){
          //det er flere registrerte her 
          quantityuntiWrapper.style.display = "block";
              
          let selectorOptions = supplier.quantity.map((quantity, i) => ({
          text: supplier.quantityname[i],
          value: quantity
          }));
      
          let selectElement = document.getElementById("quantityunitselector");
          selectElement.innerHTML = "";
              selectorOptions.forEach(option => {
                  let opt = document.createElement("option");
                  opt.text = option.text;
                  opt.value = option.value;
                  selectElement.add(opt);
              });
          }else{
              quantityuntiWrapper.style.display = "none";
          }
  
      } else {
          quantityuntiWrapper.style.display = "none";
          quantityWrapper.style.display = "none";
      }

    //hente alle selskap som var med på forrige import
    if(supplier?.importcashflowairtable){
        //hente alle selskap som var med på forrige import
        
        let body = airtablebodylistAND({supplierairtable:supplierid})
        Getlistairtable(baseid,"tblv7x4hyh6Q3v6z0",body,"returnimportcashflow");

    }
}

function returnimportcashflow(data){

    let datacleaner = rawdatacleaner(data);

    let allLines = [];

    datacleaner.forEach((importarray, index) => {
        let cachflowLines = importarray.cashflowjson
        //konvertere fra json til array
        cachflowLines = convertJsonStringsImport(cachflowLines);
        allLines = allLines.concat(cachflowLines);
    });

    let comanyes = filterOutCompanies(allLines);
    qCompanyesFromLastImport = comanyes;
}

function convertJsonStringsImport(jsonStrings) {
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

function filterOutCompanies(data) {
    const companySet = new Set();
    const companyArray = [];
  
    data.forEach(line => {
      const id = line.customerairtable;
      if (!companySet.has(id)) {
        companySet.add(id);
        companyArray.push({
          name: line.customername,
          airtable: id,
          orgnr: line.customerorgnr
        });
      }
    });
  
    return companyArray;
  }
  
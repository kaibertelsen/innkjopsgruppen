function importcontrolledcompanyes(){
    
    if(isValidDate(datestart.value)&&isValidDate(dateend.value)){
    //1
    let mc = JSON.stringify(missingComapny);
    //Registrere en import i airtable
    let body = {name:xlsimportfilename,periodestart:datestart.value,periodeend:dateend.value,missingcompanys:mc,file: xlsurl, user:[userairtableid]};
    POSTairtable(baseid,"tblv7x4hyh6Q3v6z0",JSON.stringify(body),"returnsaveimport");
    }else{
    alert("Dato perioden er ikke definert riktig.");
    }
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
        value: data.value,
        tracking: "webimporter",
        rowindex: data.rowindex,
        note: data.note,
        dachboard: ["recfJZ0PCPOrWcBLq"],
        type: "handel"
    };

    if (quantityId !== "") {
        fields.supplierquantity = [quantityId];
    }

    if (data.quantity !== "") {
        fields.quantity = data.quantity;
    }

    // 👉 Legg til cutsetting hvis kunde har en lokal avtale med denne leverandøren
    const customCut = data.cutsettings?.find(cut => cut.supplier === suplierid);

    if (customCut && customCut.cut != null) {
        fields.cut = customCut.cut;

        // legg gjerne også til mode hvis det finnes
        if (customCut.mode) {
            fields.cutmode = customCut.mode;
        }
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
          var cobject = {name:name,quantity:qantity,cuttsettings:cutsettings,kundenr:kundenr,orgnr:orgnr,airtable:airtable,note:note,value:value,rowindex:irow};
          
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
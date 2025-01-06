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


    multisave(dasaveObjectta, baseid, "tbly9xd4ho0Z9Mvlv", "returNewMultiImport");
  /*
    const records = saveObject

    const batchSize = 10;
    const delay = 300; // delay in milliseconds

    const sendBatch = async (batch) => {
    const body = batch;
    console.log(body);
    POSTairtable(baseid,"tbly9xd4ho0Z9Mvlv",JSON.stringify(body),"returnsavevalue");
    sendpacks ++
    };


    const delayExecution = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
    };

    const processBatches = async () => {
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            await sendBatch(batch);
            if (i + batchSize < records.length) {
            await delayExecution(delay);
            }
        }
    };

    processBatches();

*/
    document.getElementById("importstatuswrapper").style.display = "block";
    document.getElementById("aftercontrollelement").style.display = "none";

}


function returNewMultiImport(data){
    console.log(data);


}


function makesaveObject(data,importid){
        //lage save object
        var fields = {supplier:[suplierid],customer:[data.airtable],customernr:data.kundenr,import:[importid],value:data.value,tracking:"webimporter",rowindex:data.rowindex,note:data.note,dachboard:["recfJZ0PCPOrWcBLq"],type:"handel"};
        
        if(quantityId != ""){
        fields.supplierquantity = [quantityId];
        }
        
        if(data.quantity != ""){
        fields.quantity = data.quantity;
        }
        
        return fields
}
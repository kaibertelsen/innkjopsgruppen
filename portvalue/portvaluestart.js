
function getKlientdata(){
    let klientid = "rec1QGUGBMVaqxhp1";
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC",klientid,"klientresponse")
}

function klientresponse(data){
  
    const objects = convertJsonStringsToObjects(data.membersjson);
    console.log(objects);
}



function convertJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map(jsonString => {
        try {
            return JSON.parse(jsonString); // Konverter JSON-streng til objekt
        } catch (error) {
            console.error("Feil ved parsing av JSON-streng:", jsonString, error);
            return null; // Returner null hvis en streng ikke kan parses
        }
    });
}






function ruteresponse(data,id){
    if(id == "klientresponse"){
        klientresponse(data);
    }
    
}
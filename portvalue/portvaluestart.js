
function getKlientdata(){

let klientid = "rec1QGUGBMVaqxhp1";
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC",klientid,"klientresponse")
}

function klientresponse(data){
    console.log(data);
}






function ruteresponse(data,id){
    if(id == "klientresponse"){
        klientresponse(data);
    }
    
}
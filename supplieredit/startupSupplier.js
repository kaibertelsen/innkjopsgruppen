
function getSuppier(){     
//hente leverandører
GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC","recwnwSGJ0GvRwKFU","supplierResponse");
}

function supplierResponse(data){

    console.log(data);
}


function ruteresponse(data,id){

    if(id == "supplierResponse"){
        supplierResponse(data);
    }
}
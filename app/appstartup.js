function startUp(){
//hente user object

// loade alle leverandører JSON på klient

//loade companyselector og velge startup selskap

}

function companyChange(companyId){
// filtrer ut alle leverandører som inneholder en av gruppene som selskapet er i

//list leverandørene

//sorter etter sortnr/ alfabetisk
//send med informasjon om hvilke som alt er knyttet til leverandøren

//sjekk om filter
// søkefelt
//evt. valgte kategorier


}



function ruteresponse(data,id){
    if(id == "klientresponse"){
        klientresponse(data);
    }else if(id == "respondcustomerlistupdated"){
        respondcustomerlistupdated(data);
    }else if(id == "companyDeletedResponse"){
        companyDeletedResponse(data);
    }else if(id == "updateklientresponse"){
        updateklientresponse(data);
    }else if(id == "responPostpublicLink"){
        responPostpublicLink(data);
    }
    

}
function moreAbouteCompany(){
    //hente alle brukere
     let body = bodyFindlist(companyId,"companyId");
     Getlistairtable(baseid,"tblMhgrvy31ihKYbr",body,"responduserlist");
     
     //hent info om firma
    GETairtable(baseid,"tblFySDb9qVeVVY5c",companyId,"respondcompanyinfo");
     document.getElementById("sendingsmodul").style.display = "block";
    document.getElementById("generatelinkbutton").style.display = "inline-block";
}
    
function responduserlist(data,id){
    var users = rawdatacleaner(data);
    userstocompany = users;
    usertypes = splituserrolls(users);

    if(usertypes.admin.length == 0 && usertypes.standard.length == 0){
         //det er ingen brukere en må hente evt. invitasjoner    
        let body = bodyFindlist(companyId,"firmaid");
        Getlistairtable(baseid,"tblc1AGhwc6MMu4Aw",body,"respondinvitationlist");  
    }else{
        loadadminusers(usertypes);
    }

    messageToCompany(usertypes);
}

function splituserrolls(data){
        let ansattbrukere = [];
        let adminbrukere = [];
        let standardbrukere = [];
        
        for(var i = 0;i<data.length;i++){
            if(data[i].rolle == "ansatt"){
            ansattbrukere.push(data[i]);
            }else if(data[i].rolle == "Admin"){
            adminbrukere.push(data[i]); 
            }else if(data[i].rolle == "Bruker"){
            standardbrukere.push(data[i]);
            }
        }
        
    return {ansatt:ansattbrukere,admin:adminbrukere,standard:standardbrukere};
}
    
function messageToCompany(data){
    let count = data.ansatt.length;
    let companyname = document.getElementById("customernametext").innerHTML;
    
    
    
    let message = companyname+" har "+count+" stk. ansatte som bruker innkjøpsGRUPPEN sine private avtaler. Å ha fornøyde ansatte er svært økonomisk og vi er glade for at vi kan være med a bidra."
    
    document.getElementById("messagecompanydetalj").innerHTML = message;
    console.log(message);
    
    if(count>2){
        document.getElementById("companydetailswrapper").style.display = "block";
    }else{
        document.getElementById("companydetailswrapper").style.display = "none";   
    }
}

function respondinvitationlist(data,id){
    var invitation = rawdatacleaner(data);  
    loadadminusers({admin:[],standard:[],invitation:invitation})
}

function loadadminusers(data){
    var adminuser = data.admin;
    var standarduser= data.standard;
       
    var options = [];
    for(var i = 0;i<adminuser.length;i++){
        let text = adminuser[i].navn+" (Admin)"
        options.push({text:text,value:adminuser[i].epost});
    }
    
    for(var i = 0;i<standarduser.length;i++){
        let text = standarduser[i].navn+ " (Bruker)"
        options.push({text:text,value:standarduser[i].epost});
    }
        
       
        
    var selector = document.getElementById("usernameselector");
    if(adminuser.length>0){
        document.getElementById("resivername").value = adminuser[0].navn.split(" ")[0];
        document.getElementById("emailinput").value = adminuser[0].epost;
    }else if(standarduser.length>0){
        document.getElementById("resivername").value = standarduser[0].navn.split(" ")[0];
        document.getElementById("emailinput").value = standarduser[0].epost; 
    }else{
        document.getElementById("resivername").value = "";   
    }
        
    if(data?.invitation){
        var invitation = data.invitation;
        for(var i = 0;i<invitation.length;i++){
            let text = invitation[i].navn+ " (Invitert)"
            options.push({text:text,value:invitation[i].epost});
        }
        document.getElementById("resivername").value = invitation[0].navn.split(" ")[0];
        document.getElementById("emailinput").value = invitation[0].epost;     
    }
        
    loadselector(selector,options);
}
    
function resiceremailselectorChange(selector){
    
    // Hent den valgte 'option' i 'select'-elementet
    const selectedOption = selector.options[selector.selectedIndex];
      
    var user = findObjectProperty("epost",selectedOption.value,userstocompany);
      
    // Hent verdien og teksten til den valgte 'option'
    const value = selectedOption.value;
    const text = user.navn.split(" ")[0]
    
    document.getElementById("emailinput").value = value;
    document.getElementById("resivername").value = text;
}
    
    
    
function clearcompanyDetaljes(){
        
    //tømme selector
    const select = document.getElementById("usernameselector");
    removeOptions(select);
    document.getElementById("sendtocustomerwrapper").style.display = "none";    
    document.getElementById("companydetailswrapper").style.display = "none"; 
    
     
    //fjern tidligere link
    const linkelement = document.getElementById("customerlink");
    if (linkelement) {
        linkelement.remove();
    }
    
}
    
function respondcompanyinfo(data,id){
        
    if(data.fields?.lastfollowupdate){   
        document.getElementById("lastfollowupdatetext").innerHTML = "Fulgt opp: "+data.fields.lastfollowupdate;
    }else{
        document.getElementById("lastfollowupdatetext").innerHTML = "Ingen dato funnet";    
    }
}
    
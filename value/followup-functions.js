function startfollowinguplist(){

    //alle firma som har currentfolloupdate før 9mnd fra i dag
    let datebefore = finddateBackIntime(9);
    let datefrom = "2010-01-01"
    
   let body = generateAirtableQuery(datefrom,datebefore,"currentfollowupdate", "nofollowup");
    Getlistairtable(baseid,"tblFySDb9qVeVVY5c",body,"respondfollouplist")  
    
    // Sjekker om `mainfollowuplist` har elementer
    if (Array.isArray(mainfollowuplist) && mainfollowuplist.length > 0) {
        startfollouplist(mainfollowuplist); // Oppdaterer oppfølgingslisten
    }
 }
 
 function generateAirtableQuery(fromdate, todate, dateField, statusField) {
    let formula = `AND(IS_AFTER({${dateField}}, '${fromdate}'), IS_BEFORE({${dateField}}, '${todate}'), NOT({${statusField}} = 1))`;

    let body = JSON.stringify({
        "formula": formula,
        "pageSize": 50,
        "offset": 0
    });

    return body;
}


function respondfollouplist(data, id) {
    // Renser rådata
    var cleandata = rawdatacleaner(data);

    // Legger til neste fornyelsesdato i arrayet
    var listanddate = addNextRenewalDatetoarray(cleandata);

    // Sjekker om mainfollowuplist er forskjellig fra listanddate
    if (JSON.stringify(mainfollowuplist) !== JSON.stringify(listanddate)) {
        startfollouplist(listanddate); // Starter oppdatering av oppfølgingslisten
    }

    // Oppdaterer mainfollowuplist
    mainfollowuplist = listanddate;

    // Skjuler loader hvis den finnes
    const loader = document.getElementById("followingloader");
    if (loader) {
        loader.style.display = "none";
    }
}

 function startfollouplist(listanddate){

    let activeList= filterfollowupSelector(listanddate,"followupselector");

    const elementholder = document.getElementById("elementholderfollowup");
    if(elementholder){
        startFollowinglistElement(activeList);
    }else{
        startfollowuplist(activeList,true,"nextrenewaldate",false);
    }

 }
 
 function loadfollowingupselector(){
  
  //  11 mnd en mnd frem
  //10 mnd to mnd frem
  //9 mnd tre mnd frem
 
  let options = [
                  {
                      text:"Mangler oppfølging",
                      value:"missingfollowup"
                  },
                  {
                      text:"Fornyes innen en måned",
                      value:1
                  },
                  {
                      text:"Fornyes innen to måned",
                      value:2 
                  },
                  {
                       text:"Fornyes innen tre måned",
                       value:3
                  },{
                    text:"Er skjult fra listen",
                    value:"HIDE"
                    }
                     ];
      
  loadselector(document.getElementById("followupselector"),options);
 }

 function addNextRenewalDatetoarray(data){
     
     for(var i = 0;i<data.length;i++){
         //finne ut nestegang denne avtalen fornyes

        let startdate = data[i].winningdate;
        if(data[i]?.manuelrewaldate){
            //denne har satt manuelt en dato for fornying så regn ut (12) mnd tilbake tid og sett denne datoen
            startdate = getDateMonthsAgo(dateString, data[i].followupintervall);
        }


         let nextrenewaldate = getNextRenewalDate(data[i].followupintervall,startdate);
         let daysto = daysUntil(nextrenewaldate);
         
         data[i].nextrenewaldate = nextrenewaldate;
         data[i].daytorenewal = daysto;
         if(!data[i]?.lastfollowupdate){
             data[i].lastfollowupdate = "-";
         }
         
         
     }
 return data;
 }
 
 function getNextRenewalDate(intervall,signedDate) {
   // Konverterer signeringsdatoen til et Date-objekt
   const signedDateObj = new Date(signedDate);
   
   // Lag en ny dato som er 12 måneder frem i tid fra signeringsdatoen
   const renewalDate = new Date(signedDateObj);
   renewalDate.setMonth(signedDateObj.getMonth() + intervall);
   
   // Hvis den beregnede fornyelsesdatoen er i fortiden, fortsett å legge til 12 måneder til den er i fremtiden
   while (renewalDate < new Date()) {
     renewalDate.setMonth(renewalDate.getMonth() + intervall);
   }
   
   // Formatere datoen til YYYY-MM-DD
   const year = renewalDate.getFullYear();
   const month = String(renewalDate.getMonth() + 1).padStart(2, '0'); // Månedene er 0-indekserte, så +1
   const day = String(renewalDate.getDate()).padStart(2, '0');
   
   return `${year}-${month}-${day}`;
 }
 
 function daysUntil(targetDate) {
   // Hent dagens dato
   const today = new Date();
   
   // Hent mål-datoen
   const target = new Date(targetDate);
   
   // Beregn forskjellen i millisekunder
   const differenceInMilliseconds = target - today;
   
   // Konverter millisekunder til dager
   const millisecondsPerDay = 24 * 60 * 60 * 1000;
   const differenceInDays = Math.ceil(differenceInMilliseconds / millisecondsPerDay);
   
   return differenceInDays;
 }
 
 function filterfollowupSelector(data,selectorid){
  var selector = document.getElementById(selectorid);
 
  
    if(selector.value == "missingfollowup"){
        //list alle som mangler oppfølging
        return filteredHideFollowup(data, false);
    }else if(selector.value == "HIDE"){
        return filteredHideFollowup(data, true);
    }else{
        let fromdate = finddateforwardIntime(Number(selector.value));
        var array = [];
        for(var i = 0;i<data.length;i++){
            let date = data[i].nextrenewaldate;
            if(isDateAfter(fromdate, date)){
                //datoen her er etter filteret
                array.push(data[i]);
            }
        }
        return  filteredHideFollowup(array, false);
    }






 }

 function filteredHideFollowup(data, status) {
    let array = []; // Tom liste for filtrerte selskaper

    for (let company of data) {
        if (status) {
            // Når status er true, returner kun selskaper med "HIDE"
            if (company.followupstatus === "HIDE") {
                array.push(company);
            }
        } else {
            // Når status er false, returner kun selskaper som IKKE har "HIDE"
            if (company.followupstatus !== "HIDE") {
                array.push(company);
            }
        }
    }

    return array; // Returner den filtrerte listen
}





 function isDateAfter(date1, date2) {
   // Konverterer strengene til Date-objekter
   const d1 = new Date(date1);
   const d2 = new Date(date2);
   
   // Sammenlign datoene
   return d1 > d2;
 }
 
 
 function followingupclick(rowelement){
 let dataitemid = rowelement.dataset.id;
 
 var companyobject = findObjectProperty("airtableId",dataitemid,buffercompanydata);
 //clikc on button bestarelse
 document.getElementById("besparelsebutton").click();
 companySelected(dataitemid,companyobject.Name);
 }
 
 function saveDataInFollowUp(){
 
 let link = document.getElementById("customerlink").href;
 let email = document.getElementById("emailinput").value;
 let date = getTodayInISOFormat();
 var body = {link:link,company:[companyId],email:email,user:[userairtableid],date:date,type:"link"}
 
 
 POSTairtable(baseid,"tblpPJVCiLyce6ygN",JSON.stringify(body),"responseFollowingup"); 
 
 }
 function responseFollowingup(data,id){
 
 console.log(data);
  document.getElementById("lastfollowupdatetext").innerHTML = "Fulgt opp: "+data.fields.date;
  
  //fjerne fra liste i oppfølgingsmodulen
  var object = findObjectProperty("airtable",companyId,mainfollowuplist);
  if(object){
  //finn row elementet og fjern det
  document.getElementById("row"+"followuplist"+companyId).remove();
 
  //fjern object fra liste
  deletObjectProperty("airtable",companyId,mainfollowuplist);
 
 //load listen på nytt
 filterfollowupSelector("followupselector");
 }
 }
 
function startfollowuplist(data,load,sortname,descending){

    
    sortnameproperty = sortname;
   if(load){
   listarray = [];
   }
   listarray = data;
   let newitembutton = false;
   let placenewitembutton = "topp";
   
   let tabelid = "tblFySDb9qVeVVY5c";
   let viewColums = ["Name","winningdate","lastfollowupdate","daytorenewal","nextrenewaldate"];
   let saveColums = [0,0,0,0];
   let labledColums = ["Kunde","Vunnetdato","Sist oppfulgt","Dager til fornyes","Fornyes dato"];
   let justifyColums = ["start","end","end","end","end"];
   let typeColums = ["text","text","text","text","text"];
   let typeEditelement = ["text","text","text","text","text"];
   let cellClass = ["cellitem","cellitem","cellitem","redboltitem","cellitem"];
   //let headerColums = Object.keys(data[0]);
   let spaceColums = "1fr ".repeat(viewColums.length).trim();
   
   
    //sorterer som standard etter første kollonne
    var returnobject = sortarrayrows(sortname,descending,listarray);
     
     
   let property= {
   rowclick:true,
   newitembutton:newitembutton,
   placenewitembutton:placenewitembutton,
   saveColums:saveColums,
   tableid:tabelid,
   typeEditelement:typeEditelement,
   viewColums:viewColums,
   labledColums:labledColums,
   spaceColums:spaceColums,
   justifyColums:justifyColums,
   typeColums:typeColums,
   idflagg:"airtable",
   classrow:"rowclickable",
   classHeaderrow:"headerrow",
   cellClass:cellClass,
   sortname:returnobject.sortname,
   descending:returnobject.descending
   };

   
   const list = document.getElementById("followuplist");
   rowGenerator(returnobject.array,list,property);

}
 

function getDateMonthsAgo(dateString, monthsAgo) {
    if (!dateString || !Number.isInteger(monthsAgo)) return null; // Returner null hvis input er ugyldig

    const date = new Date(dateString);

    if (isNaN(date)) return null; // Returner null hvis datoen er ugyldig

    // Juster måneden med det angitte antallet måneder tilbake
    date.setMonth(date.getMonth() - monthsAgo);

    // Håndter månedens dager (f.eks., 31. mars til 28. februar)
    if (date.getDate() !== new Date(dateString).getDate()) {
        date.setDate(0); // Sett datoen til siste dag i forrige måned
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Legg til ledende null for måned
    const day = String(date.getDate()).padStart(2, "0"); // Legg til ledende null for dag

    return `${year}-${month}-${day}`;
}

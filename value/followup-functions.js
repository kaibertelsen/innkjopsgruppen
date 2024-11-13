function startfollowinguplist(){
   
   
    if(!mainfollowuplist.length>0){
    //alle firma som har currentfolloupdate før 9mnd fra i dag
    let datebefore = finddateBackIntime(9);
    let datefrom = "2010-01-01"
    
   let body = generateAirtableQuery(datefrom,datebefore,"currentfollowupdate", "nofollowup", false);

    Getlistairtable(baseid,"tblFySDb9qVeVVY5c",body,"respondfollouplist")  
    }
 }
 
 function generateAirtableQuery(fromdate, todate, dateField, statusField, statusValue) {
    // Konverter statusValue til riktig Airtable-format (TRUE() eller FALSE())
    const statusCheck = statusValue ? "TRUE()" : "FALSE()";

    // Bygg formelen dynamisk med dato-sjekk og status-sjekk
    let formula = `AND(IS_AFTER({${dateField}}, '${fromdate}'), IS_BEFORE({${dateField}}, '${todate}'), NOT({${statusField}} = ${statusCheck}))`;

    let body = JSON.stringify({
        "formula": formula,
        "pageSize": 50,
        "offset": 0
    });

    return body;
}






 function respondfollouplist(data,id){
     
 var cleandata = rawdatacleaner(data);
 
 
 var listanddate = addNextRenewalDatetoarray(cleandata);
 mainfollowuplist = listanddate;
 //gå gjennom den lokale datovelger
 filterfollowupSelector("followupselector");
 document.getElementById("followingloader").style.display = "none";
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
                  }
                     ];
      
  loadselector(document.getElementById("followupselector"),options);
 }
 function addNextRenewalDatetoarray(data){
     
 
     for(var i = 0;i<data.length;i++){
         //finne ut nestegang denne avtalen fornyes
         let nextrenewaldate = getNextRenewalDate(data[i].followupintervall,data[i].winningdate);
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
 
 function filterfollowupSelector(selectorid){
  var selector = document.getElementById(selectorid);
  var data = mainfollowuplist;
  
  var array = [];
  if(selector.value == "missingfollowup"){
      //list alle som mangler oppfølging
     startfollowuplist(data,true,"nextrenewaldate",false);
  }else{
      
      let fromdate = finddateforwardIntime(Number(selector.value));
      for(var i = 0;i<data.length;i++){
        let date = data[i].nextrenewaldate;
         if(isDateAfter(fromdate, date)){
             //datoen her er etter filteret
            array.push(data[i]);
         }
      }
      
     startfollowuplist(array,true,"nextrenewaldate",false); 
  }
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
 
 
 
 
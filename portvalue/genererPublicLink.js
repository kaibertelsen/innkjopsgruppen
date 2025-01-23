function genetatepublicLink(){
    let companytext = "IG link til Monitor";
    let expirationdate = finddateforwardIntime(3);
    let body = {
            query: "baseId=app1WzN1IxEnVu3m0&tableId=tbldZL68MyLNBRjQC&rowId=rec1QGUGBMVaqxhp1",
            note: companytext,
            expirationDate: expirationdate
          }
    POSTairtablepublicLink(JSON.stringify(body),"responPostpublicLink");
}

function finddateforwardIntime(mnd) {
    // Hent dagens dato
    const today = new Date();
    
    // Legg til 3 måneder til dagens dato
    today.setMonth(today.getMonth() + mnd);
    
    // Formatere datoen til YYYY-MM-DD
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Månedene er 0-indekserte, så +1
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}



function responPostpublicLink(data,id){

   // Fjern eventuell gammel link hvis den finnes
   const existingLink = document.getElementById('customerlink');
   if (existingLink) {
       existingLink.remove();
   }


      // Opprett et nytt anker-element
      const link = document.createElement('a');
      link.id = "customerlink";
      
      // Sett href-attributtet til ønsket URL
      link.href = "https://portal.innkjops-gruppen.no/portvaluemonitor?"+"shareKey="+data.shareKey+"&shareId="+data.shareId;
      
      
      // Sett linkens tekstinnhold
      link.textContent = "Gå til monitor";
      
      // Gjør linken til en ny fane ved å sette target-attributtet til '_blank'
      link.target = '_blank';
      // Legg til inline-stil for å gjøre linken svart
      link.style.color = 'black';
      
      // Legg til linken i dokumentet, f.eks. i en div med id 'linkContainer'
      document.getElementById('generatpubliclinkbutton').parentElement.appendChild(link);
}
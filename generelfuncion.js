var updateCompany = false;





document.addEventListener('DOMContentLoaded', function() {
    getGroup();
});
    
MemberStack.onReady.then(function(member) {
        if (member.loggedIn){
                if (member.membership.id!="6362bb533e485100048c26f6"){
                //har ikke rettigheter
                const urlpage = 'https://portal.innkjopssjefen.no/login';
                window.location.href = urlpage;
                }
          }else{
          window.location.href = "https://portal.innkjops-gruppen.no/";
          }
});


function getGroup(){
        let body = airtablebodylistAND({arkivert:0});
        Getlistairtable("app1WzN1IxEnVu3m0","tblorC4ev3l2UIUG5",body,"responsgroup");
}
    
function responsgroup(data){
        data = rawdatacleaner(data);
        // Sorter dataene alfabetisk etter 'Name'
        data.sort((a, b) => a.Name.localeCompare(b.Name));
        
        // Hent select-elementet fra HTML
        const selectElement = document.querySelector('#group');
        
        // Iterer over dataene og opprett <option> elementer
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.airtableId;  // Verdien til <option>
            option.text = item.Name;   // Teksten som vises i dropdown
            selectElement.appendChild(option);  // Legg til <option> i <select>
        });
}
    
document.getElementById("valueselector").addEventListener('change', function() {
        // Din kode her
        let value = document.getElementById("valueselector").value
        
        if(value == "annet"){
        document.getElementById("verdi").style.display = "block";
        document.getElementById("verdi").value = "";
        }
        else{
        document.getElementById("verdi").value = value;
        document.getElementById("verdi").style.display = "none";
        }
        
});


const dataOutput = document.querySelector('lr-data-output');
dataOutput.addEventListener('lr-data-output', (e) => {
 
  /*
  fileurlinputarray = [];
  for(var i = 0;i<e.detail.data.files.length;i++){
  var object = {filename:e.detail.data.files[i].name,url:e.detail.data.files[i].cdnUrl}
  fileurlinputarray.push(object);
  }
*/

document.getElementById("logolonk-1").value = e.detail.data.files[0].cdnUrl
   
 
 // fileurlinputarray
});

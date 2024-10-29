document.addEventListener('DOMContentLoaded', function() {
    getGroup();
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
document.getElementById("startlinkListButton").onclick = function() {
    //henter alle linker som er sendt inn

    let body = airtablebodylistAND({type:"link"});
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC","reckTUK3Ia0LghhaI","respondLinkList");
}


function respondLinkList(data,id){
    console.log(data);
}

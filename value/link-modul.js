document.getElementById("startlinkListButton").onclick = function() {
    //henter alle linker som er sendt inn

    let body = airtablebodylistAND({type:"link"});
    GETairtable("app1WzN1IxEnVu3m0","tbldZL68MyLNBRjQC","reckTUK3Ia0LghhaI","respondLinkList");
}

function respondLinkList(data){
  
    
    if (!data || !data.fields || !data.fields.followupjson || !Array.isArray(data.fields.followupjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields.followupjson' som en array.");
        return;
    }
    let followup = convertFollowUpJsonStringsToObjects(data.fields.followupjson);

    listLinks(followup);

}

function convertFollowUpJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
        try {
            // Parse hoved JSON-streng til et objekt
            const data = JSON.parse(jsonString);
            if (!data.linkloggjson) {
                data.linkloggjson = [];
            } 
            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}

function listLinks(followups){
    const list = document.getElementById("linklistwrapper");
    list.innerHTML = "";

    const library = document.getElementById("linklibraryconteiner");
    const node = library.querySelector(".linkrow");

    //sorter etter dato nyest øverst
    followups.sort((a, b) => new Date(b.date) - new Date(a.date));


    followups.forEach(followup => {
        const clone = node.cloneNode(true);
        clone.querySelector(".companyname").innerText = followup.company || "-";
        clone.querySelector(".datelinksendt").innerText = formatNorwegianDate(followup.date);
        clone.querySelector(".linkfromuser").innerText = followup.user || "-";
        clone.querySelector(".linktouser").innerText = followup.email || "-";

        clone.querySelector(".linkbutton").onclick = function(){
            //åpne linken i eget vindu
            window.open(followup.link);
        }

       

        if (followup.linkloggjson.length > 0){
            listLinksElement(followup.linkloggjson,clone);
        }else{
            const linkstatus = clone.querySelector(".linkstatus");
            if (linkIsOpen){
                linkstatus.innerText = "Linken er ikke åpnet av kunde";
                linkstatus.style.color = "red";
            }
        }

        

        list.appendChild(clone);
    });


    
}

function listLinksElement(linklogs,clone){
    const list = clone.querySelector(".linklogglist");
    list.innerHTML = "";

    const library = document.getElementById("linklibraryconteiner");
    const node = library.querySelector(".sublinkrow");

    
    let linkIsOpen = false;

    //sorter etter dato nyest øverst
    linklogs.sort((a, b) => new Date(b.open) - new Date(a.open));

    linklogs.forEach(linklog => {
        const clonesub = node.cloneNode(true);
        clonesub.querySelector(".datelinkopen").innerText = formatNorwegianDate(linklog.open);
        clonesub.querySelector(".userlinkopentext").innerText = linklog.user || linklog.comment
        clonesub.querySelector(".devisetype").innerText = linklog.device || "-";

        if(!linklog.superadmin){
            linkIsOpen = true;
        }

        list.appendChild(clonesub);
    });


    const linkstatus = clone.querySelector(".linkstatus");
    if (linkIsOpen){
        linkstatus.innerText = "Linken er åpnet";
        linkstatus.style.color = "green";
    }else{
        linkstatus.innerText = "Linken er ikke åpnet av kunde";
        linkstatus.style.color = "red";
    }


}

function formatNorwegianDate(isoString) {
    const date = new Date(isoString);
  
    // Månedsnavn på norsk (kortversjon)
    const monthNames = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
  
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();
  
    return `${day}.${month} ${year}`;
  }
 
  
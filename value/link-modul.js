var gFollowUplist = [];

document.getElementById("startlinkListButton").onclick = function() {
    //henter alle linker som er sendt inn
    listLinks(gFollowUplist);
}

function respondLinkList(data){
  
    if (!data || !data.fields || !data.fields.followupjson || !Array.isArray(data.fields.followupjson)) {
        console.error("Ugyldig dataformat: Forventet et objekt med 'fields.followupjson' som en array.");
        return;
    }
    let followup = convertFollowUpJsonStringsToObjects(data.fields.followupjson);
    gFollowUplist = followup;
   
    countLinktstatusDachboard(followup);

}

function countLinktstatusDachboard(followup) {
    const selector = document.getElementById("dashboarddateselector");
    const [fromStr, toStr] = selector.value.split(",");
    const fromDate = new Date(fromStr);
    const toDate = new Date(toStr);

    // Hjelpefunksjon: sjekk om en dato er innenfor valgt periode
    function isWithinPeriod(dateString) {
        const date = new Date(dateString);
        return date >= fromDate && date <= toDate;
    }

    // Åpnet av kunde (minst én logg uten superadmin, innen perioden)
    const linkopen = followup.filter(f =>
        f.linkloggjson.some(log => 
            !log.superadmin && isWithinPeriod(log.open)
        )
    );

    // Ikke åpnet (enten ingen åpning, eller kun superadmin, innen perioden)
    const linkclose = followup.filter(f => {
        const logsInPeriod = f.linkloggjson.filter(log => isWithinPeriod(log.open));
        return logsInPeriod.length === 0 || logsInPeriod.every(log => log.superadmin);
    });

    const sum = linkopen.length + linkclose.length;
    const dachboardcountLinks = document.getElementById("dachboardcountLinks");
    dachboardcountLinks.innerText = `${linkopen.length}/${sum}`;
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

    const followupLinkselector = document.getElementById("followupLinkselector");
    const followupLinkselectorValue = followupLinkselector.value;
    
    if (followupLinkselectorValue === "true") {
        // Vis kun de hvor linken er åpnet av noen som ikke er superadmin
        followups = followups.filter(followup =>
            followup.linkloggjson.some(log => !log.superadmin)
        );
    } else if (followupLinkselectorValue === "false") {
        // Vis kun de hvor linken ikke er åpnet av noen (eller kun av superadmin)
        followups = followups.filter(followup =>
            followup.linkloggjson.length === 0 ||
            followup.linkloggjson.every(log => log.superadmin)
        );
    }
    
    //sorter etter dato nyest øverst
    followups.sort((a, b) => new Date(b.date) - new Date(a.date));

    // oppdatere linkcountertext
    document.getElementById("linkcountertext").innerText = followups.length+"stk.";

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
                linkstatus.innerText = "Linken er ikke åpnet av kunde";
                linkstatus.style.color = "red";
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

        if(linklog.superadmin){
            clonesub.querySelector(".userlinkopentext").innerText = linklog.user + " (superadmin)";
        }else{
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
 

document.getElementById("followupLinkselector").addEventListener("change", () => {
    listLinks(gFollowUplist);
});
  
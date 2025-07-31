function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(`Failed to load script: ${url}`);
        document.head.appendChild(script);
    });
}

// Liste over CDN-URL-er som skal lastes inn
const cdnScripts = [
    "https://kaibertelsen.github.io/innkjopsgruppen/app/appstartup.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/app/elementtriggers.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/app/filterlist.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/app/companyprofile.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/app/crypto.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/app/employeeview.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/apicomcurrent.js"
];

// Laste inn alle skriptene sekvensielt
cdnScripts.reduce((promise, script) => {
    return promise.then(() => loadScript(script));
}, Promise.resolve()).then(() => {
    console.log("All scripts loaded");
    ruteContorll();
    MemberStack.onReady.then(function(member) {
        if (member.loggedIn){
            isLoggedin = true;
            userid = member.airtableid;
            memberId = member.id;
            companyId = member.airtableidfirma;
            memberObject = member;

           // Sjekker om det er en bruker som ikke har fått bruker i Airtable
        if (!member?.airtableid) {
            console.log("Bruker venter på bruker i Airtable");

            // Opprett visuell melding
            errorMessageElement = document.createElement("div");
            errorMessageElement.style.position = "fixed";
            errorMessageElement.style.top = "50%";
            errorMessageElement.style.left = "50%";
            errorMessageElement.style.transform = "translate(-50%, -50%)";
            errorMessageElement.style.backgroundColor = "white";
            errorMessageElement.style.padding = "20px";
            errorMessageElement.style.border = "1px solid black";
            errorMessageElement.style.fontSize = "18px";
            errorMessageElement.style.zIndex = "9999";
            errorMessageElement.style.textAlign = "center";
            errorMessageElement.innerHTML = `
                <p>🛠️ Førstegangsoppsett pågår...</p>
                <p>Vi klargjør din bruker og tilknytning til selskapet i Innkjøps-gruppen.</p>
                <p>Dette skjer kun ved første innlogging.</p>
                <p>Vennligst vent <span id="countdown">10</span> sekunder.</p>
            `;


            document.body.appendChild(errorMessageElement);

            // Start nedtelling
            let count = 10;
            const countdownEl = document.getElementById("countdown");
            countdownInterval = setInterval(() => {
                count--;
                countdownEl.textContent = count;
                if (count <= 0) {
                    clearInterval(countdownInterval);
                }
            }, 1000);

            // Last siden på nytt etter 20 sekunder
            reloadTimeout = setTimeout(() => {
                location.reload();
            }, 10000);


            //sjekker om der er en bruker i airtable med dette memberid
            haveUserInAirtable(memberId);

            return;
        }

    

        //sjekke om det er en bruker som venter på et selskap
        if (sessionStorage.getItem("startupEmployer") !== "true") {
            startUp(userid);
            rootPageControll("list");
        }else{
            startWaitForCompany(companyId);
        }
        
        sessionStorage.removeItem("rootToApp"); // Sletter nøkkelen etter omdirigering
        }else{
            isLoggedin = false;
            rootPageControll("login");
            loadLoggInfo();
        }
    });

}).catch(error => {
    console.error(error);
});
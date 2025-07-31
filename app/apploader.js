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
            const errorMessage = document.createElement("div");
            errorMessage.style.position = "fixed";
            errorMessage.style.top = "50%";
            errorMessage.style.left = "50%";
            errorMessage.style.transform = "translate(-50%, -50%)";
            errorMessage.style.backgroundColor = "white";
            errorMessage.style.padding = "20px";
            errorMessage.style.border = "1px solid black";
            errorMessage.style.fontSize = "18px";
            errorMessage.style.zIndex = "9999";
            errorMessage.style.textAlign = "center";
            errorMessage.innerHTML = `
                <p>🛠️ Førstegangsoppsett pågår...</p>
                <p>Vi klargjør din bruker og tilknytning til selskapet i Innkjøps-gruppen.</p>
                <p>Dette skjer kun ved første innlogging.</p>
                <p>Vennligst vent <span id="countdown">20</span> sekunder.</p>
            `;


            document.body.appendChild(errorMessage);

            // Start nedtelling
            let count = 20;
            const countdownEl = document.getElementById("countdown");
            const countdownInterval = setInterval(() => {
                count--;
                countdownEl.textContent = count;
                if (count <= 0) {
                    clearInterval(countdownInterval);
                }
            }, 1000);

            // Last siden på nytt etter 20 sekunder
            setTimeout(() => {
                location.reload();
            }, 20000);


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
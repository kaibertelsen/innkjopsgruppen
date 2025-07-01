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

            // Sjekker om det er en bruker ikke har fått bruker i airtable
            if (!member?.airtableid) {
                console.log("Bruker har ikke bruker i airtable");

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
        }
    });

}).catch(error => {
    console.error(error);
});
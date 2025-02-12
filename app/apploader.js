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
            startUp(userid);
            rootPageControll("list");
            sessionStorage.removeItem("rootToApp"); // Sletter nøkkelen etter omdirigering
        }else{
            isLoggedin = false;
            rootPageControll("login");
        }
    });

}).catch(error => {
    console.error(error);
});
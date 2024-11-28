
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
    "https://kaibertelsen.github.io/innkjopsgruppen/createcompany/apicom.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/createcompany/opprett.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/createcompany/opprettbruker.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/createcompany/generelfuncion.js"
];

// Laste inn alle skriptene sekvensielt
cdnScripts.reduce((promise, script) => {
    return promise.then(() => loadScript(script));
}, Promise.resolve()).then(() => {
    console.log("All scripts loaded");
    setTodaysDate();
}).catch(error => {
    console.error(error);
});

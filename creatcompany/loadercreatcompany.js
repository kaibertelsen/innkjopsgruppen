
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
    "https://kaibertelsen.github.io/innkjopsgruppen/creatcompany/apicom.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/creatcompany/opprett.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/creatcompany/opprettbruker.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/creatcompany/generelfuncion.js",
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

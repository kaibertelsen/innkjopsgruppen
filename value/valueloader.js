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
    "https://kaibertelsen.github.io/innkjopsgruppen/value/followup-functions.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/value/followup-listfunction.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/value/xlsexport.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/value/downloadcompanylist.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/value/dachboard-function.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/value/customerlist.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/value/customerEdit.js",
    "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.2.0/exceljs.min.js"
];

// Laste inn alle skriptene sekvensielt
cdnScripts.reduce((promise, script) => {
    return promise.then(() => loadScript(script));
}, Promise.resolve()).then(() => {
    console.log("All scripts loaded");
}).catch(error => {
    console.error(error);
});

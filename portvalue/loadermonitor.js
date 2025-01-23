

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
    "https://kaibertelsen.github.io/innkjopsgruppen/portvalue/portvaluestart.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/portvalue/monitor.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/portvalue/converters.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/portvalue/calculating.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/portvalue/liquidity.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/portvalue/customerlist.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/portvalue/xlsexport.js",
    "https://kaibertelsen.github.io/innkjopsgruppen/apicomcurrent.js",
    "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.2.0/exceljs.min.js"

];


// Laste inn alle skriptene sekvensielt
cdnScripts.reduce((promise, script) => {
    return promise.then(() => loadScript(script));
}, Promise.resolve()).then(() => {
    console.log("All scripts loaded");
    startAutoUpdate();
}).catch(error => {
    console.error(error);
});

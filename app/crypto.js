// Bruk CryptoJS fra CDN hvis du ikke har installert det via npm
//<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>

// 🔑 Generer en tilfeldig 256-bit SECRET_KEY og lagre i localStorage
function generateSecretKey() {
    let key = CryptoJS.lib.WordArray.random(32).toString(); // 256-bit nøkkel
    localStorage.setItem("SECRET_KEY", key);
    return key;
}

// 📌 Hent SECRET_KEY fra localStorage, eller lag en ny hvis den ikke finnes
function getSecretKey() {
    return localStorage.getItem("SECRET_KEY") || generateSecretKey();
}

// 🔒 Krypter hvilken som helst tekst eller JSON-data
function encryptData(data) {
    let key = getSecretKey();
    let jsonData = typeof data === "string" ? data : JSON.stringify(data); // Konverter til string hvis JSON
    return CryptoJS.AES.encrypt(jsonData, key).toString();
}

// 🔓 Dekrypter data
function decryptData(encryptedData) {
    let key = getSecretKey();
    let bytes = CryptoJS.AES.decrypt(encryptedData, key);
    let decrypted = bytes.toString(CryptoJS.enc.Utf8);

    // Fjern nøkkelen etter dekryptering for sikkerhet
    localStorage.removeItem("SECRET_KEY");

    try {
        return JSON.parse(decrypted); // Forsøk å parse JSON
    } catch {
        return decrypted; // Returner som tekst hvis ikke JSON
    }
}


// Bruk CryptoJS fra CDN hvis du ikke har installert det via npm
// <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>

// 🔑 Generer en tilfeldig 256-bit SECRET_KEY og lagre i localStorage
function generateSecretKey() {
    let key = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex); // 256-bit nøkkel i HEX-format
    localStorage.setItem("SECRET_KEY", key);
    return key;
}

// 📌 Hent SECRET_KEY fra localStorage, eller lag en ny hvis den ikke finnes
function getSecretKey() {
    let key = localStorage.getItem("SECRET_KEY");
    return key ? CryptoJS.enc.Hex.parse(key) : CryptoJS.enc.Hex.parse(generateSecretKey());
}

// 🔒 Krypter data med AES
function encryptData(data) {
    let key = getSecretKey();
    let jsonData = typeof data === "string" ? data : JSON.stringify(data); // Konverter til string hvis JSON
    return CryptoJS.AES.encrypt(jsonData, key).toString();
}

// 🔓 Dekrypter data med AES
function decryptData(encryptedData) {
    let key = getSecretKey();
    let bytes = CryptoJS.AES.decrypt(encryptedData, key);
    let decrypted = bytes.toString(CryptoJS.enc.Utf8);

    // Fjern nøkkelen etter dekryptering for ekstra sikkerhet
    localStorage.removeItem("SECRET_KEY");

    try {
        return JSON.parse(decrypted); // Forsøk å parse JSON
    } catch {
        return decrypted; // Returner som tekst hvis ikke JSON
    }
}




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

// 🔒 Krypter data og returner én enkelt streng
function encryptData(data) {
    let key = getSecretKey();
    let iv = CryptoJS.lib.WordArray.random(16); // Initialiseringsvektor (IV)

    let jsonData = typeof data === "string" ? data : JSON.stringify(data); // Konverter til string hvis JSON

    let encrypted = CryptoJS.AES.encrypt(jsonData, key, { iv: iv }).toString();

    // Kombiner IV og kryptert data i ett JSON-objekt, og base64-enkod det
    let combinedData = JSON.stringify({ encrypted: encrypted, iv: iv.toString(CryptoJS.enc.Hex) });

    return btoa(combinedData); // Base64-enkoder for URL-sikker overføring
}


// 🔓 Dekrypter data fra én enkelt base64-enkodet streng
function decryptData(encryptedString) {
    // Base64-dekoder
    let decodedString = atob(encryptedString);
    
    // Parse JSON tilbake til objekt
    let encryptedObject = JSON.parse(decodedString);

    // Sjekk at vi har de nødvendige verdiene
    if (!encryptedObject || !encryptedObject.encrypted || !encryptedObject.iv) {
        console.error("Feil: Ugyldig kryptert objekt", encryptedObject);
        return null;
    }

    let key = getSecretKey();
    let iv = CryptoJS.enc.Hex.parse(encryptedObject.iv); // Konverter IV tilbake til WordArray

    try {
        let bytes = CryptoJS.AES.decrypt(encryptedObject.encrypted, key, { iv: iv });
        let decrypted = bytes.toString(CryptoJS.enc.Utf8);

        return JSON.parse(decrypted); // Forsøk å parse JSON
    } catch (error) {
        console.error("Dekrypteringsfeil:", error);

        //etter 3 sekunder, hvis det ikke er dekryptert, så gå til adresse
        setTimeout(() => {
            window.location.href = "https://portal.innkjops-gruppen.no/app-portal";
        }, 3000);
        return null;
    }
}







function findObjectByKey(globalGroups, searchValue, key) {
    // Bruk Array.find() for å søke etter objektet basert på en spesifikk nøkkel
    const result = globalGroups.find(group => group[key] === searchValue);
    return result || false;
}
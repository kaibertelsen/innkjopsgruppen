function getUniqueGroups(objects) {
    const uniqueGroups = {}; // Bruk et objekt for å unngå duplikater

    objects.forEach(obj => {
        if (obj.group && obj.groupname) {
            uniqueGroups[obj.group] = obj.groupname; // Lagre gruppe som nøkkel
        }
    });

    // Konverter resultatet til en array
    return Object.keys(uniqueGroups).map(group => ({
        group,
        groupname: uniqueGroups[group]
    }));
}

function convertJsonStringsToObjects(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
        try {
            // Parse hoved JSON-streng til et objekt
            const data = JSON.parse(jsonString);
            if (!data.cashflowjson) {
                data.cashflowjson = [];
            } 

            if (!data.bruker) {
                data.bruker = [];
            } 

            return data;
        } catch (error) {
            console.error(`Feil ved parsing av JSON-streng på indeks ${index}:`, jsonString, error);
            return null; // Returner null hvis parsing feiler
        }
    });
}

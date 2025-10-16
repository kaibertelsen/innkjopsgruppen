async function multisaveAirtable(data, baseid, tabelid) {
    const batchSize = 10;
    const totalRows = data.length;
    let uploadedRows = 0;
    const allResponses = [];

    const sendBatch = async (batch) => {
        try {
            console.log("Sender batch:", batch);
            const response = await POSTairtableMulti(baseid, tabelid, batch);
            uploadedRows += batch.length;

            statusProcessing(totalRows, uploadedRows);
            allResponses.push(response);
        } catch (error) {
            console.error("Feil ved sending av batch:", error);
            throw error;
        }
    };

    const processBatches = async () => {
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            await sendBatch(batch);
        }

        statusProcessing(totalRows, uploadedRows);
        console.log("Alle rader er ferdig prosessert.");
    };

    try {
        statusProcessing(totalRows, uploadedRows);
        await processBatches();
        multiimportRespond({ success: true, data: allResponses});
    } catch (error) {
        console.error("Prosesseringen ble stoppet på grunn av en feil:", error);
        statusProcessing(totalRows, uploadedRows);
        multiimportRespond({ success: false, error: error.message});
    }
}

async function POSTairtableMulti(baseId, tableId, body) {
    return new Promise(async (resolve, reject) => {
        try {
            const token = await MemberStack.getToken();
            console.log("Token mottatt:", token);

            let requestBody = body.map(item => ({ fields: { ...item } }));

            console.log("Request Body som skal sendes:", requestBody);

            const response = await fetch(
                `https://expoapi-zeta.vercel.app/api/row?baseId=${baseId}&tableId=${tableId}&token=${token}`,
                {
                    method: "POST",
                    body: JSON.stringify(requestBody),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Feilrespons fra API: ${response.status} - ${response.statusText}`);
                console.error("Responsdata fra API:", errorText);
                reject(new Error(`HTTP-feil! status: ${response.status} - ${response.statusText}`));
            } else {
                const data = await response.json();
                console.log("Batch lagret med suksess:", data);
                resolve(data); // Returner responsdata for denne batchen
            }
        } catch (error) {
            console.error("Feil i POSTairtableMulti:", error);
            reject(error);
        }
    });
}

function statusProcessing(totalRows, uploadedRows) {
    let statusEl;

    const doneMessage = (text, count) =>
        `<strong style="font-size: 1.1rem; color: green; opacity: 0; transition: opacity 0.5s;">✔️ ${count} ${text} – Ferdig!</strong>`;

    const progressMessage = (text, current, total) =>
        `<strong style="font-size: 1.1rem;">${text}</strong> (${current} av ${total})`;

    statusEl = document.getElementById("statusUploadingLable");
    if (!statusEl) return;

    if (uploadedRows >= totalRows) {
        statusEl.innerHTML = doneMessage("Handelslinjer opprettet i databasen", uploadedRows);
        requestAnimationFrame(() => statusEl.firstChild.style.opacity = 1);
    } else {
        statusEl.innerHTML = progressMessage("Oppretter handelslinjer i databasen", uploadedRows, totalRows);
    }

}

function multiimportRespond(data) {
    console.log("Respons fra multiimport:", data);
}


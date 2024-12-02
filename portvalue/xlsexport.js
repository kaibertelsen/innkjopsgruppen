document.getElementById("xlsexportbutton").addEventListener("click", () => {
    // Mapping til nye navn
    const fieldMapping = {
        Name: "Navn",
        orgnr: "Org.nr",
        groupname: "Gruppe",
        valuegroup: "Abonnement",
        winningdate: "Vunnet dato",
        invoicedate: "Faktura dato",
        exit: "Oppsigelses dato",
        airtable:"SystemID"
    };

    // Hent tekstverdier fra selectorer
    const dashboardGroupSelector = document.getElementById("dashboardgroupselector");
    const customerListSelector = document.getElementById("customerlistselector");

    const dashboardGroupText = dashboardGroupSelector.options[dashboardGroupSelector.selectedIndex].text || "Alle";
    const customerListText = customerListSelector.options[customerListSelector.selectedIndex].text || "Alle";

    // Generer filnavn
    let filename = `Kunder - ${dashboardGroupText} - ${customerListText}`;

    // Eksporter til Excel
    exportData(activeCustomerlist, fieldMapping, filename);
});

function exportData(rawDataArray,fieldMapping, fileName) {
    
    // Forbered dataene med omdøpte nøkler
    const preparedData = prepareExportDataArray(rawDataArray, fieldMapping);

    // Eksporter til Excel
    exportXLS(preparedData, fileName);
}

function prepareExportDataArray(rawDataArray,fieldMapping) {
     // Hent nøkkelnavnene i fieldMapping som selectedFields
     const selectedFields = Object.keys(fieldMapping);
    return rawDataArray.map(rawData => {
        const preparedData = {};
        selectedFields.forEach(field => {
            const newFieldName = fieldMapping[field]; // Hent nytt navn fra mapping
            let value = rawData[field];

            if (Array.isArray(value)) {
                // Kombiner arrays til kommaseparerte strenger
                preparedData[newFieldName] = value.join(", ");
            } else if (value === undefined || value === null) {
                // Sett tom streng for undefined eller null verdier
                preparedData[newFieldName] = "";
            } else if (field === "winningdate" ||field === "invoicedate" ||field === "exit") {
                 // Formater dato til 'yyyy-mm-dd' for Excel
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        // Gyldig dato
                        preparedData[newFieldName] = date.toISOString().split("T")[0]; // yyyy-mm-dd
                    } else {
                        // Ugyldig dato
                        preparedData[newFieldName] = ""; 
                    }
            } else {
                // Behold verdien som den er
                preparedData[newFieldName] = value;
            }
        });
        return preparedData;
    });
}

async function exportXLS(rows, name) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(name);

    // Hent header fra det første objektet
    const headers = Object.keys(rows[0]);

    // Legg til header-raden
    worksheet.addRow(headers);

    // Legg til data-rader
    rows.forEach(row => {
        worksheet.addRow(headers.map(header => row[header] || ""));
    });

    // Style header-raden (rad 1)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true }; // Fet skrift
    headerRow.eachCell(cell => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D3D3D3' }, // Lys grå bakgrunn
        };
    });

    // Juster kolonnebredder
    worksheet.columns.forEach((column, colIndex) => {
        let maxLength = headers[colIndex].length; // Minimum bredde som lengden på header
        column.eachCell({ includeEmpty: true }, cell => {
            const cellLength = cell.value ? cell.value.toString().length : 10;
            if (cellLength > maxLength) {
                maxLength = cellLength;
            }
        });
        column.width = Math.min(maxLength + 2, 30); // Legg til litt ekstra plass, maks bredde 30 tegn
    });

    // Fryse første rad
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Lagre filen
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name + ".xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
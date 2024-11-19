
document.getElementById("xlsexportbutton").addEventListener("click", () => {
    // Feltene du vil hente
    const selectedFields = ["lastmodified", "companyorgnr", "companyname", "useremail", "companybrukernavn"];

    // Mapping til nye navn
    const fieldMapping = {
        lastmodified: "Dato",
        companyorgnr: "Orgnummer",
        companyname: "Selskapsnavn",
        useremail: "Innsender",
        companybrukernavn: "Brukere"
    };

    let filename = "Tilkoblinger for "+GlobalConnections[0].suppliername[0];
    // Eksporter til Excel
    exportData(GlobalConnections, selectedFields, fieldMapping, filename, "excel");
});

function exportData(rawDataArray, selectedFields, fieldMapping, fileName, format) {
    // Forbered dataene med feltnavnene omdøpt
    const preparedData = prepareExportDataArray(rawDataArray, selectedFields, fieldMapping);

    // Velg eksportformat (Excel eller CSV)
    if (format === "excel") {
        exportXLS(preparedData, fileName); // Eksporter til Excel
    } else if (format === "csv") {
        exportCSV(preparedData, fileName); // Eksporter til CSV
    } else {
        console.error("Ugyldig eksportformat. Bruk 'excel' eller 'csv'.");
    }
}

function prepareExportDataArray(rawDataArray, selectedFields) {
    return rawDataArray.map(rawData => {
        const preparedData = {};
        selectedFields.forEach(field => {
            if (Array.isArray(rawData[field])) {
                // Kombiner arrays til kommaseparerte strenger
                preparedData[field] = rawData[field].join(", ");
            } else if (rawData[field] === undefined || rawData[field] === null) {
                // Sett tom streng for undefined eller null verdier
                preparedData[field] = "";
            } else {
                // Behold verdien som den er
                preparedData[field] = rawData[field];
            }
        });
        return preparedData;
    });
}

async function exportXLS(rows, name, dateColumns = []) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(name);

    // Hent header fra det første objektet
    const headers = Object.keys(rows[0]);

    // Legg til header-raden
    worksheet.addRow(headers);

    // Legg til data-rader
    rows.forEach(row => {
        worksheet.addRow(headers.map(header => row[header]));
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

        // Sjekk om denne kolonnen er en dato og sett datoformat
        if (dateColumns.includes(headers[colIndex])) {
            column.numFmt = "yyyy-mm-dd hh:mm:ss"; // Sett ønsket datoformat
        }
    });

    // Fryse første rad
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Lagre filen
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "Klinketil-" + name + ".xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function exportCSV(rows, name) {
    if (!rows || rows.length === 0) {
        console.error("Ingen rader å eksportere.");
        return;
    }

    // Hent nøklene fra det første objektet for å bruke som headers
    const headers = Object.keys(rows[0]);

    // Lag CSV-dataen som en streng
    let csvContent = headers.join(',') + '\n'; // Legg til header-raden

    rows.forEach(row => {
        const rowData = headers.map(header => {
            let value = row[header] ?? ''; // Sett tom streng som standard

            // Hvis verdien er NaN eller inneholder specialValue: "NaN", erstatt med tom streng
            if (typeof value === 'object' && value?.specialValue === 'NaN') {
                value = '';
            }

            // Hvis verdien er en tekst som inneholder komma, omslutt med anførselstegn
            if (typeof value === 'string' && value.includes(',')) {
                value = `"${value}"`;
            }

            return value;
        }).join(','); // Slå sammen radverdier med komma
        csvContent += rowData + '\n'; // Legg til rad i CSV-en
    });

    // Opprett en Blob med CSV-innholdet
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Generer filnavn uten spesialtegn
    const sanitizedFileName = name.replace(/[^a-zA-Z0-9_-]/g, "");

    // Lag nedlastingslenke
    if (navigator.msSaveBlob) { 
        navigator.msSaveBlob(blob, "Klinketil-" + sanitizedFileName + ".csv");
    } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "Klinketil-" + sanitizedFileName + ".csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}



document.getElementById("xlsexportbutton").addEventListener("click", () => {
    preExport(GlobalConnections);
});

function preExport(data){
console.log(data[0]);
}

async function exportXLS(rows, name) {
    if (!rows || rows.length === 0) {
        console.error("Ingen rader å eksportere.");
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(name);

    // Hent nøklene fra det første objektet for å bruke som headers
    const headers = Object.keys(rows[0]);

    // Legg til header-raden
    worksheet.addRow(headers);

    // Legg til alle dataene, erstatt NaN eller specialValue NaN med tom string
    rows.forEach(row => {
        const rowData = headers.map(header => {
            const value = row[header];

            // Hvis verdien er NaN eller inneholder specialValue: "NaN", erstatt med tom string
            if (typeof value === 'object' && value?.specialValue === 'NaN') {
                return '';
            }

            return isNaN(value) && typeof value === 'number' ? '' : value; 
        });
        worksheet.addRow(rowData);
    });

    // Style header-raden (rad 1)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true }; // Fet skrift
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D3D3D3' }, // Lys grå bakgrunn
        };
    });

    // Juster kolonnebredder automatisk basert på innhold med maks bredde på 30 tegn og minimum som header-lengde
    worksheet.columns.forEach((column, colIndex) => {
        let maxLength = headers[colIndex].length; // Sett minimum bredde som lengden på header
        column.eachCell({ includeEmpty: true }, (cell) => {
            const cellLength = cell.value ? cell.value.toString().length : 10; // Sett en minimum bredde for tomme celler
            if (cellLength > maxLength) {
                maxLength = cellLength;
            }
        });
        column.width = Math.min(maxLength + 2, 30); // Legg til 2 ekstra tegn og sett maks bredde til 30 tegn
    });

    // Fryse første rad
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Lagre filen
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    const sanitizedFileName = name.replace(/[^a-zA-Z0-9_-]/g, "");
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "Klinketil-" + sanitizedFileName + ".xlsx";
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


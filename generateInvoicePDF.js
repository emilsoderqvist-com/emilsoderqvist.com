function formatPhoneNumber(phone) {
    if (!phone) return "";

    // Ta bort allt som inte är siffror
    const digits = String(phone).replace(/\D/g, "");

    // Svenskt mobilnummer: 0701234567 -> 070-123 45 67
    if (digits.length === 10 && digits.startsWith("07")) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
    }

    return phone;
}

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function formatMoney(value) {
    return new Intl.NumberFormat("sv-SE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value) + " kr";
}

function formatDate(date) {
    if (!date) return "";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat("sv-SE").format(d);
}

function generateInvoicePDF(data, outputPath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(outputPath);

        doc.pipe(stream);

    /*
     * ---------------------------------------------------------
     * COLORS / CONSTANTS
     * ---------------------------------------------------------
     */

    const black = "#222222";
    const gray = "#666666";
    const lightGray = "#eeeeee";
    const borderGray = "#cccccc";

    const pageWidth = doc.page.width;
    const contentWidth =
        pageWidth - doc.page.margins.left - doc.page.margins.right;


    /*
     * ---------------------------------------------------------
     * HELPERS
     * ---------------------------------------------------------
     */

    function text(text, x, y, options = {}) {
        doc.fillColor(options.color || black)
            .font(options.font || "Helvetica")
            .fontSize(options.size || 10)
            .text(String(text ?? ""), x, y, {
                width: options.width,
                align: options.align || "left",
                lineBreak: false
            });
    }

    function line(x1, y1, x2, y2, color = borderGray) {
        doc.strokeColor(color)
            .lineWidth(1)
            .moveTo(x1, y1)
            .lineTo(x2, y2)
            .stroke();
    }

    function box(x, y, width, height, fill = null) {
        if (fill) {
            doc.rect(x, y, width, height)
                .fillAndStroke(fill, borderGray);
        } else {
            doc.rect(x, y, width, height)
                .stroke(borderGray);
        }
    }


// =========================
// ÖVRE INFORMATION
// =========================

const invoiceX = 50;
const invoiceY = 50;

const companyX = 330;
const companyY = 50;

const customerX = 50;
const customerY = 180;

const infoGray = "#777777";


// =========================
// FAKTURA / KVITTO
// =========================

doc.fillColor("black")
    .font("Helvetica-Bold")
    .fontSize(24)
    .text(
        data.type === "kvitto" ? "KVITTO" : "FAKTURA",
        invoiceX,
        invoiceY
    );

doc.font("Helvetica")
    .fontSize(10)
    .fillColor(infoGray);

// Kvitto
if (data.type === "kvitto") {

    doc.text(
        `Kvittonummer: ${data.number}`,
        invoiceX,
        invoiceY + 40
    );

    doc.text(
        `Datum: ${data.date}`,
        invoiceX,
        invoiceY + 55
    );

// Faktura
} else {

    doc.text(
        `Fakturanummer: ${data.number}`,
        invoiceX,
        invoiceY + 40
    );

    doc.text(
        `Datum: ${data.date}`,
        invoiceX,
        invoiceY + 55
    );

    doc.text(
        `Förfallodatum: ${data.dueDate}`,
        invoiceX,
        invoiceY + 70
    );
}


// =========================
// FÖRETAG - UPPE TILL HÖGER
// =========================

doc.fillColor(infoGray)
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("black")
    .text(data.company.name, companyX, companyY, {
        width: 215,
        align: "right"
    });

doc.font("Helvetica")
    .fontSize(9)
    .fillColor(infoGray)

    .text(`Org.nr: ${data.company.orgNumber}`, companyX, companyY + 22, {
        width: 215,
        align: "right"
    })

    .text(`Momsreg.nr: ${data.company.vatNumber}`, companyX, companyY + 36, {
        width: 215,
        align: "right"
    })

    .text(data.company.address, companyX, companyY + 50, {
        width: 215,
        align: "right"
    })

    .text(
        `${data.company.postalCode} ${data.company.city}`,
        companyX,
        companyY + 64,
        {
            width: 215,
            align: "right"
        }
    )

    .text(`Telefon: ${data.company.phone}`, companyX, companyY + 78, {
        width: 215,
        align: "right"
    })

    .text(data.company.email, companyX, companyY + 92, {
        width: 215,
        align: "right"
    })

    .text(data.company.website, companyX, companyY + 106, {
        width: 215,
        align: "right"
    })

    .fillColor("black")
    .font("Helvetica-Bold")
    .text("Godkänd för F-skatt", companyX, companyY + 140, {
        width: 215,
        align: "right"
    })

    if (data.type != "kvitto") {
        doc.text("Betalningsvillkor", companyX, companyY + 180, {
            width: 215,
            align: "left"
        })

        .font("Helvetica")
        .text("30 dagar", companyX, companyY + 190, {
            width: 215,
            align: "left"
        })

        .text("Inkludera ert personnumer som meddelande")
    }

// =========================
// KUND - VÄNSTER OVANFÖR VARORNA
// =========================

doc.fillColor(infoGray)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Kund", customerX, customerY);

doc.font("Helvetica")
    .fontSize(13)
    .font("Helvetica-Bold")
    .fillColor("black")
    // Namn
    .text(
        data.customer.name || "",
        customerX,
        customerY + 20
    )

    .fontSize(10)
    .fillColor(infoGray)
    .font("Helvetica")

    .text(
        `Personnummer: ${data.customer.personNumber || ""}`,
        customerX,
        customerY + 40
    )

        // Adress
    .text(
        data.customer.address || "",
        customerX,
        customerY + 55
    )

    // Postnummer + stad
    .text(
        `${data.customer.postalCode || ""} ${data.customer.city || ""}`,
        customerX,
        customerY + 70
    )

    // Telefon
    .text(
        `Telefon: ${formatPhoneNumber(data.customer.phone)}`,
        customerX,
        customerY + 85
    )

    // Kund-ID
    .text(
        `Kundnummer: ${data.customer.id || ""}`,
        customerX,
        customerY + 100
    )


// Återställ färgen så resten av PDF:en inte blir grå
doc.fillColor("black");


    /*
     * ---------------------------------------------------------
     * ARTICLES
     * ---------------------------------------------------------
     */

    let tableY = 300;
    const tableX = 50;
    const tableWidth = 495;

    const columns = {
        quantity: {
            x: tableX,
            width: 50
        },

        name: {
            x: tableX + 50,
            width: 190
        },

        price: {
            x: tableX + 240,
            width: 100
        },

        vat: {
            x: tableX + 340,
            width: 60
        },

        total: {
            x: tableX + 400,
            width: 95
        }
    };

    const headerHeight = 28;

    // Header backgrounds
    for (const column of Object.values(columns)) {
        doc.rect(
            column.x,
            tableY,
            column.width,
            headerHeight
        ).fill(lightGray);
    }

    // Header outer border
    box(tableX, tableY, tableWidth, headerHeight);

    // Vertical column lines
for (const column of Object.values(columns)) {
    if (column.x !== tableX) {
        line(
            column.x,
            tableY,
            column.x,
            tableY + headerHeight
        );
    }
}

    // Header background
    doc.rect(50, tableY, contentWidth, headerHeight)
        .fill(lightGray);

    // Header borders
    box(tableX, tableY, tableWidth, headerHeight);

    text("Antal", columns.quantity.x + 5, tableY + 9, {
        size: 9,
        font: "Helvetica-Bold"
    });

    text("Artikel", columns.name.x + 5, tableY + 9, {
        size: 9,
        font: "Helvetica-Bold"
    });

    text("Pris exkl. moms", columns.price.x, tableY + 9, {
        size: 8,
        font: "Helvetica-Bold",
        width: columns.price.width - 5,
        align: "right"
    });

    text("Moms", columns.vat.x, tableY + 9, {
        size: 9,
        font: "Helvetica-Bold",
        width: columns.vat.width - 5,
        align: "right"
    });

    text("Totalt", columns.total.x, tableY + 9, {
        size: 9,
        font: "Helvetica-Bold",
        width: columns.total.width - 5,
        align: "right"
    });

    /*
     * ---------------------------------------------------------
     * CALCULATE ARTICLES
     * ---------------------------------------------------------
     */

    let totalExclVat = 0;
    let totalVat = 0;
    let totalRut = 0;

    const articleRows = [];

    for (const article of data.articles || []) {
        const quantity = Number(article.quantity) || 0;
        const price = Number(article.priceExclVat) || 0;
        const vatRate = Number(article.vatRate) || 0;
        const rutRate = Number(article.rutRate) || 0;

        const rowExclVat = quantity * price;
        const rowVat = rowExclVat * (vatRate / 100);
        const rowInclVat = rowExclVat + rowVat;

        // RUT beräknas på arbetskostnaden inklusive moms
        const rowRut = rowInclVat * (rutRate / 100);

        totalExclVat += rowExclVat;
        totalVat += rowVat;
        totalRut += rowRut;

        articleRows.push({
            quantity,
            name: article.name || "",
            price,
            vatRate,
            rutRate,
            rowExclVat,
            rowVat,
            rowInclVat,
            rowRut
        });
    }

    const totalInclVat = totalExclVat + totalVat;
    const amountToPay = totalInclVat - totalRut;


    /*
     * ---------------------------------------------------------
     * DRAW ARTICLES
     * ---------------------------------------------------------
     */

    let rowY = tableY + headerHeight;
    const rowHeight = 27;

    for (const article of articleRows) {

        // Check if we need another page
        if (rowY + rowHeight > doc.page.height - 150) {
            doc.addPage();

            rowY = 50;

            // Repeat table header
            doc.rect(50, rowY, contentWidth, headerHeight)
                .fill(lightGray);

            box(tableX, tableY, tableWidth, headerHeight);

            text("Antal", columns.quantity.x + 5, rowY + 9, {
                size: 9,
                font: "Helvetica-Bold"
            });

            text("Artikel", columns.name.x + 5, rowY + 9, {
                size: 9,
                font: "Helvetica-Bold"
            });

            text("Pris exkl. moms", columns.price.x, rowY + 9, {
                size: 8,
                font: "Helvetica-Bold",
                width: columns.price.width,
                align: "right"
            });

            text("Moms", columns.vat.x, rowY + 9, {
                size: 9,
                font: "Helvetica-Bold",
                width: columns.vat.width,
                align: "right"
            });

            text("Totalt", columns.total.x, rowY + 9, {
                size: 9,
                font: "Helvetica-Bold",
                width: columns.total.width,
                align: "right"
            });

            rowY += headerHeight;
        }

        box(tableX, rowY, tableWidth, rowHeight);

        text(article.quantity, columns.quantity.x + 5, rowY + 8, {
    size: 9
});

        text(article.name, columns.name.x + 5, rowY + 8, {
            size: 9,
            width: columns.name.width - 10
        });

        text(
            formatMoney(article.price),
            columns.price.x,
            rowY + 8,
            {
                size: 9,
                width: columns.price.width - 5,
                align: "right"
            }
        );

        text(
            `${article.vatRate}%`,
            columns.vat.x,
            rowY + 8,
            {
                size: 9,
                width: columns.vat.width - 5,
                align: "right"
            }
        );

        text(
            formatMoney(article.rowExclVat),
            columns.total.x,
            rowY + 8,
            {
                size: 9,
                width: columns.total.width - 5,
                align: "right"
            }
        );

        rowY += rowHeight;
    }


    // =========================
    // TOTALS
    // =========================

    rowY += 20;

    const totalsX = 340;
    const totalsValueX = 470;

    text("Totalt exkl. moms", totalsX, rowY, {
        size: 10,
        font: "Helvetica-Bold",
        width: 120,
        align: "right"
    });

    text(
        formatMoney(totalExclVat),
        totalsValueX,
        rowY,
        {
            size: 10,
            width: 75,
            align: "right"
        }
    );

    rowY += 20;

    text("Moms", totalsX, rowY, {
        size: 10,
        width: 120,
        align: "right"
    });

    text(
        formatMoney(totalVat),
        totalsValueX,
        rowY,
        {
            size: 10,
            width: 75,
            align: "right"
        }
    );

    rowY += 20;

    text("Totalt inkl. moms", totalsX, rowY, {
        size: 10,
        width: 120,
        align: "right"
    });

    text(
        formatMoney(totalInclVat),
        totalsValueX,
        rowY,
        {
            size: 10,
            width: 75,
            align: "right"
        }
    );

    // RUT-avdrag
    if (totalRut > 0) {
        rowY += 20;

        text("RUT-avdrag", totalsX, rowY, {
            size: 10,
            font: "Helvetica-Bold",
            width: 120,
            align: "right"
        });

        text(
            "-" + formatMoney(totalRut),
            totalsValueX,
            rowY,
            {
                size: 10,
                font: "Helvetica-Bold",
                width: 75,
                align: "right"
            }
        );
    }

    rowY += 25;

    line(totalsX, rowY - 5, pageWidth - 50, rowY - 5);

    text(data.type === "kvitto" ? "Summa" : "Att betala", totalsX, rowY + 5, {
        size: 13,
        font: "Helvetica-Bold",
        width: 120,
        align: "right"
    });

    text(
        formatMoney(amountToPay),
        totalsValueX,
        rowY + 5,
        {
            size: 13,
            font: "Helvetica-Bold",
            width: 75,
            align: "right"
        }
    );

    text(
        data.comment,
        50,
        rowY - 75,
        {
            width: 290,
        }
    )

    if (totalRut > 0) {
        rowY += 45;

        text("RUT-avdrag", 50, rowY, {
            size: 11,
            font: "Helvetica-Bold"
        });

        rowY += 18;

        text(
            `Preliminär skattereduktion för RUT-arbete: ${formatMoney(totalRut)}`,
            50,
            rowY,
            {
                size: 9,
                width: contentWidth
            }
        );

        rowY += 15;

        text(
            `Arbetet utförs på: ${data.customer.address || ""}, ${data.customer.postalCode || ""} ${data.customer.city || ""}`,
            50,
            rowY,
            {
                size: 9,
                width: contentWidth
            }
        );

        rowY += 15;

        text(
            `Arbetsdatum: ${formatDate(data.date)}`,
            50,
            rowY,
            {
                size: 9,
                width: contentWidth
            }
        );

        rowY += 15;

        text(
            "Kunden ansvarar för att förutsättningarna för RUT-avdrag är uppfyllda. Skattereduktionen är preliminär och kan komma att justeras om Skatteverket inte medger hela avdraget.",
            50,
            rowY,
            {
                size: 8,
                color: gray,
                width: contentWidth
            }
        );
    }

    /*
     * ---------------------------------------------------------
     * VAT BREAKDOWN
     * ---------------------------------------------------------
     */

    rowY += 50;

    const vatGroups = {};

    for (const article of articleRows) {
        if (!vatGroups[article.vatRate]) {
            vatGroups[article.vatRate] = {
                exclVat: 0,
                vat: 0
            };
        }

        vatGroups[article.vatRate].exclVat += article.rowExclVat;
        vatGroups[article.vatRate].vat += article.rowVat;
    }


    /*
     * ---------------------------------------------------------
     * FOOTER
     * ---------------------------------------------------------
     */

    const footerY = doc.page.height - 70;
    const footerSecondRowX = 50 + 220;
    

    line(50, footerY - 10, pageWidth - 50, footerY - 10);

    text(
        data.company?.name || "",
        50,
        footerY,
        {
            size: 8,
            color: gray,
            font: "Helvetica-Bold"
        }
    );

    text(
        data.company?.email || "",
        50,
        footerY + 12,
        {
            size: 8,
            color: gray
        }
    );

    text(
        data.company?.website || "",
        50,
        footerY + 24,
        {
            size: 8,
            color: gray
        }
    );

    /////

        text(
        "Betalningsinformation",
        footerSecondRowX,
        footerY,
        {
            size: 8,
            color: gray,
            font: "Helvetica-Bold"
        }
    );

    text(
        "Bankgiro: 714-5238",
        footerSecondRowX,
        footerY + 12,
        {
            size: 8,
            color: gray
        }
    );

    text(
        "Swish: 1231743020",
        footerSecondRowX,
        footerY + 24,
        {
            size: 8,
            color: gray
        }
    );


    /*
     * ---------------------------------------------------------
     * FINISH
     * ---------------------------------------------------------
     */

    doc.end();

        stream.on("finish", () => {
            resolve(outputPath);
        });

        stream.on("error", reject);
    });
}

module.exports = generateInvoicePDF;
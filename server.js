const express = require("express");
const favicon = require('serve-favicon');

// File system
const fs = require("fs");
const path = require("path");

const generateInvoicePDF = require("./generateInvoicePDF");

const app = new express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static('public'));
app.use(favicon(path.join(__dirname, 'public', '/images/bracket.png')));

app.get("/", (req, res) => {
    res.render("it-help");
});

app.get("/pris", (req, res) => {
    res.render("price");
});

app.get("/kontakt", (req, res) => {
    res.render("contact");
});

app.get("/vem", (req, res) => {
    res.render("vem.ejs");    
});

app.get("/portfolio", (req, res) => {
    res.render("portfolio");
});

app.get("/faktura", (req, res) => {
    res.render("invoice");
});

// 404 Redirect
app.get("/*", (req, res) => {
    res.redirect("/");
});

app.post("/create-invoice", async (req, res) => {
    try {
        const {
            type,
            number,
            date,
            dueDate,
            company,
            customer,
            comment
        } = req.body;

        const articles = req.body.quantity.map((quantity, i) => ({
            quantity: Number(quantity),
            name: req.body.article_name[i],
            priceExclVat: Number(req.body.priceExclVat[i]),
            vatRate: Number(req.body.vatRate[i]),
            rutRate: Number(req.body.rutRate[i]) || 0
        }));

        const data = {
            type,
            number,
            date,
            dueDate,
            comment,

            company: {
                name: req.body.company_name,
                orgNumber: req.body.company_orgNumber,
                vatNumber: req.body.company_vatNumber,
                address: req.body.company_address,
                city: req.body.company_city,
                postalCode: req.body.company_postalCode,
                phone: req.body.company_phone,
                email: req.body.company_email,
                website: req.body.company_website
            },

            customer: {
                name: req.body.customer_name,
                phone: req.body.customer_phone,
                personNumber: req.body.customer_personNumber,
                id: req.body.customer_id,
                address: req.body.customer_address,
                city: req.body.customer_city,
                postalCode: req.body.customer_postalCode
            },

            articles
        };

        const outputDir = path.join(__dirname, ".", "receipts");

        await fs.promises.mkdir(outputDir, { recursive: true });

        const filename = `${type.charAt(0).toUpperCase() + type.slice(1)}-${data.company.name}-${data.customer.id}-${date}.pdf`;
        const outputPath = path.join(outputDir, filename);

        await generateInvoicePDF(data, outputPath);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

        res.sendFile(outputPath, async (err) => {
            if (err) {
                console.error("Send file error:", err);
                return;
            }

            try {
                await fs.promises.unlink(outputPath);
                console.log("Deleted temporary PDF:", outputPath);
            } catch (deleteError) {
                console.error("Could not delete PDF:", deleteError);
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Kunde inte skapa fakturan.");
    }
});

app.listen(PORT, () => {
    console.log(`Running server on http://localhost:${PORT}`);
})
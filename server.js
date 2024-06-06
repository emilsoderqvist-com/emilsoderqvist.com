const express = require("express");

const app = express();
const PORT = 1415;

app.get("/", (req, res) => {
    res.send("Hello");
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}!`);
});
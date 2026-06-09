const express = require("express");
const favicon = require('serve-favicon');

// File system
const fs = require("fs");
const path = require("path");

const app = new express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static('public'));
app.use(favicon(path.join(__dirname, 'public', '/images/bracket.png')));

// Home Page
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/teknik", (req, res) => {
    res.render("it-help");
});

app.get("/tabg", (req, res) => {
    res.render("tabg");
});

app.get("/api/tabg", (req, res) => {
    let APPID = 823130;
    let URL = "https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid="

    fetch(URL + APPID).then(res2 => {
        res2.json().then(data => {
            res.json(data["response"]["player_count"]);
        })
    })
});

// 404 Redirect
app.get("/*", (req, res) => {
    res.redirect("/");
});

app.listen(PORT, () => {
    console.log(`Running server on http://localhost:${PORT}`);
})
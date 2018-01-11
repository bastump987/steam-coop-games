'use strict';

const path       = require("path");
const utils      = require("./utils.js");
const mysql      = require("mysql");
const dbkey      = require("./dbkey.js");
const express    = require("express");
const bodyParser = require("body-parser");


const app = express();

app.use(express.static("./public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname + "/index.html"));
});

app.post("/search", (req, res) => {
	let searchTerm = req.body.searchTerm;
	utils.searchSteam(searchTerm, (data) => res.send(data));
});

app.listen(8080, () => console.log("Server listening on port 8080."));

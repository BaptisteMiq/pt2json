const { pt2json, json2pt } = require("../../lib/index.js");
const { readFileSync, writeFileSync } = require("fs");

const json = pt2json(readFileSync("./interfaces", "utf-8"), { tabs: true, key_separator: " " });
const tab = "       ";
json[tab + "dns-nameservers"] = "192.168.1.12";
writeFileSync("new_interfaces", json2pt(json, { key_separator: " " }));
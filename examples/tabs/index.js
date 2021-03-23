const { pt2json, json2pt } = require("pt2json");
const { readFileSync, writeFileSync } = require("fs");

const json = pt2json(readFileSync("./interfaces", "utf-8"), { tabs: true });
const tab = "       ";
json[tab + "dns-nameservers"] = "192.168.1.12";
writeFileSync("new_interfaces", json2pt(json));
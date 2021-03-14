const fs = require("fs");
const { json2pt } = require("../../lib/index.js");

// Convert json data to txt
fs.readFile("./sample.json", "utf-8", (err, data) => {
    if (err) return;

    json2pt(JSON.parse(data)).then((fromJson) => {
        fs.writeFileSync("./sample.txt", fromJson);
    });
});
const fs = require("fs");
const { pt2json, json2pt } = require("../../lib/index.js");

// Full example
fs.readFile("./hosts", "utf-8", (err, data) => {
    if (err) return;

    pt2json(data).then((jsonObj) => {

        // Add a key value
        jsonObj["192.168.0.5"] = "other.super.website.com";

        // Add a comment to the first line
        jsonObj["__comments"].push({
            value: "# This comment is at the beggining of the file",
            index: -1
        });

        // Add new websites to a list of existing values
        const myWebsitesToAdd = [
            "super.website.com",
            "super.websitealias1.com",
            "super.websitealias2.com",
        ];
        myWebsitesToAdd.forEach((url) => jsonObj["192.168.0.1"].push(url));

        // Convert back to original file
        json2pt(jsonObj).then((plainTextFile) => {
            fs.writeFileSync("./hosts_from_json", plainTextFile);
        });

    });
});
const fs = require("fs");
const { pt2json, json2pt } = require("../../lib/index.js");

fs.readFile("./server.properties", "utf-8", (err, data) => {
    if (err) return;

    const options = {
        comments: true, // Keep comments
        indexed: true, // Keep properties order
        separator: "=", // For 'key=value' format
        key_separator: "-" // For 'key1-key2=value' format
    };
    const serverCfg = pt2json(data, options);
    
    // Edit server config
    serverCfg.level.seed.value = Math.round(Math.random()*1e10);
    serverCfg.level.name.value = "my_world";
    serverCfg.motd.value = "Hi !";

    serverCfg.spawn.monsters.value = false;
    serverCfg.pvp.value = false;

    // We don't need to specify the ".value" if the order of properties is not important.
    // So writing serverCfg.motd = "Hi !" would be completely valid.

    // Save new config
    fs.writeFileSync("./new_server.properties", json2pt(serverCfg));

});
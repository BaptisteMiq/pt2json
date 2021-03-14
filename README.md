# Plain Text to Json


This node module converts a plain text config file to JSON format and vice versa.

```text
welcome_text "Hello World"
```

```json
{
    "welcome_text": {
        "value": "\"Hello World\"",
        "index": 0
    }
}
```

## Why?

Some config files are formatted as plain text format (e.g. [Linux interfaces](https://www.cyberciti.biz/faq/setting-up-an-network-interfaces-file/), [Windows hosts](https://en.wikipedia.org/wiki/Hosts_(file)), [some game configuration files](https://docs.fivem.net/docs/server-manual/setting-up-a-server), ...) and may be difficult to interact with using scripts. Converting them to JSON objects allows to easily edit values and save them back to the original file format.

## How to use

### Install

```bash
npm i pt2json
```

### Import module

```js
const { pt2json, json2pt } = require("pt2json");
```

### Convert Plain Text to JSON

```js
pt2json("key value").then((jsonObj) => {
    console.log(jsonObj); // { key: { value: 'value', index: 0 } }
});
```

### Convert JSON to Plain Text

```js
json2pt({ "key": "value" }).then((text) => {
    console.log(text); // key value
});
```

### Edit a value

```js
const data = `key1 key2 value`;

pt2json(data).then((jsonObj) => {
    jsonObj.key1.key2 = `"Hello World"`;
    json2pt(jsonObj).then((text) => {
        console.log(text); // key1 key2 "Hello World"
    });
});
```

### Push to array

When multiple keys are found at the same level and with the same name, it creates an array. Here, an array labeled as ```start``` will contain ```["example1", "example2"]```. Because it's an array we can easily add or remove items in it:

```js
const data = `start example1
start example2`;

pt2json(data).then((jsonObj) => {
    console.log(jsonObj.start.length); // 2
    jsonObj.start.push("example3");
    json2pt(jsonObj).then((text) => {
        console.log(text);
        /*
        start example1
        start example2
        start example3
        */
    });
});
```

### Custom index

By default, pt2json will keep the line order by creating an object containing its values and its index. By editing the index manually, we can choose where to insert an item:

```js
const data = `first i0
second i1
fourth i2`;

pt2json(data).then((jsonObj) => {
    jsonObj["third"] = {
        value: "i1",
        index: 1 // Will be added after "second" (index 1)
    }
    json2pt(jsonObj).then((text) => {
        console.log(text);
        /*
        first i0
        second i1
        third i1
        fourth i2
        */
    });
});
```

# Read and write files

```js
const fs = require("fs");

fs.readFile("./plain_text", "utf-8", (err, data) => {
    if (err) return;

    pt2json(data).then((jsonObj) => {
        jsonObj.key = "value"

        json2pt(jsonObj).then((plainTextFile) => {
            fs.writeFileSync("./new_plain_text", plainTextFile);
        });
    });
});
```

See more complex examples in the ```examples/``` folder.


## Author & License

Made by Baptiste Miquel under the MIT license.
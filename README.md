# Plain Text to Json


This node module converts a plain text config file to JSON format and vice versa.

```text
my_property = my_value

my_array = value1
my_array = value2
```

```json
{
    "my_property": "my_value",
    "my_array": [
        "value1",
        "value2"
    ]
}
```

## Why?

Some config files are formatted as plain text format (e.g. [Linux interfaces](https://www.cyberciti.biz/faq/setting-up-an-network-interfaces-file/), [Windows hosts](https://en.wikipedia.org/wiki/Hosts_(file)), [some game configuration files](https://docs.fivem.net/docs/server-manual/setting-up-a-server), ...) and may be difficult to interact with using scripts. Converting them to JSON objects allows to easily edit values and save them back to the original file format.

### Examples

* [Windows hosts file](https://github.com/BaptisteMiq/pt2json/tree/main/examples/windows_hosts)
* [Linux interfaces](https://github.com/BaptisteMiq/pt2json/tree/main/examples/interfaces)
* [Minecraft properties](https://github.com/BaptisteMiq/pt2json/tree/main/examples/minecraft)



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
const myJson = pt2json("my_key=my_value");
// { "my_key": "my_value" }
```

### Convert JSON to Plain Text

```js
const myPlainText = json2pt({ "my_key": "my_value" });
// my_key=my_value
```

### Editing a value

```js
const data = `key value`;

const jsonObj = pt2json(data);
jsonObj.key = `"Hello World"`;

json2pt(jsonObj);
// key "Hello World"
```

### Pushing to an array

When multiple keys are found at the same level and with the same name, it creates an array. Here, an array labeled as ```start``` will contain ```["example1", "example2"]```. Because it's an array we can easily add or remove items in it:

```js
const data = `start=example1
start=example2`;

const jsonObj = pt2json(data);
jsonObj.start.push("example3");

json2pt(jsonObj);
/*
start example1
start example2
start example3
*/
```

## Options

### Default options

#### pt2json

You can define options when converting from plain text to json:

```js
// Default options
const options = {
    separator: "=", // key / value separator. Default for "key=value".
    key_separator: " ", // key / key separator. Default for "key1 key2=value".
    comments: false, // Keep comments that starts with "#". Default will not keep them.
    emptyLines: false, // Keep empty lines. Default will not keep them.
    tabs: false, // Left trim the key. Default will trim.
    indexed: false, // Keep keys order after conversion. See bellow for more informations .
};
pt2json(file, options);
```

#### json2pt

You can also define some options when converting json to plain text.

Note that some options will be automatically applied according to the json object structure:
* `comments` and `emptyLines` will be applied if the according array are found in the json (see bellow)
* `indexed` objects are kept if a value has the corresponding structure (`{value: string, index: number}`)
* `tabs` will automatically be kept if found

```js
// Default options
const options = {
    separator: "=", // Same as pt2json separator option
    key_separator: " " // Same as pt2json key_separator option
};
json2pt(file, options);
```

### Using custom options

#### Custom separator

You can specify which separator to use for key / value combo. Default separator is set to `=`.
When using custom separator for converting plain text to json, it will be stored on the generated json.

```js
const data = `key1 = value`; // Spaces between separator are automatically removed
pt2json(data); // { "key1": "value" }

const data = `key1,value`;
pt2json(data); // { "key,value": null } | Invalid!
pt2json(data, { separator: "," }); // { "key": "value", __params: { separator: ',' } }
//                                      --------------  -----------------------------
//                                          Valid!            Separator is stored

json2pt({"key": "value"}); // key=value
json2pt({"key": "value"}, { separator: "," }); // key,value
```

#### Composed keys

Some properties can have composed keys like: 

In plain text:

`key1 key2 key3 = value`

In json:

```json
{ "key1": { "key2": { "key3": "value" } } }
```

Pt2json allows such behaviour by creating nested objects:
```js
const data = `key1 key2 key3 = value`;

const pt = pt2json(data); // { "key1": { "key2": { "key3": "value" } } }
pt.key1.key2.key3 = "new value";
```

You can also define custom key separators with the `key_separator` parameter:

```js
const data = `key1-key2-key3 = value`;

const pt = pt2json(data, { "key_separator": "-" }); // { "key1": { "key2": { "key3": "value" } } }
pt.key1.key2.key3 = "new value";

json2pt({"key1":{"key2":{"key3":"value"}}}); // key1 key2 key3=value
json2pt({"key1":{"key2":{"key3":"value"}}}, { key_separator: "-" }); // key1-key2-key3=value
```


### Comments and empty lines

Some config files can have comments or empty lines, those can be detected with the option `comments` and `emptyLines`. By default, those options are inactive thus comments and empty lines will not be kept after conversion.

When converting from plain text to json,
* `comments` are stored into the `__comments` property array.
* `emptyLines` are stored into the `__emptyLines` property array.


Note that both options will only work if the `indexed` option is set to true.

```js
const data = `
# User infos
first_name John
last_name Doe

# User contact
# User contact
mail jdoe@example.com
`;

const jsonObj = pt2json(data, {
    comments: true,
    emptyLines: true,
    indexed: true
});

jsonObj.__comments.splice(1, 1); // Remove duplicate comment
json2pt(jsonObj);
/*
# User infos
first_name John
last_name Doe

# User contact
mail jdoe@example.com
*/
```


### Custom indexes

Pt2json can keep the line order by creating an object containing its value and its index.

```js
// Without indexes
const pt = pt2json("my_key=my_value"); // { "my_key": "my_value" }

pt.my_key = "new value";
```

```js
// With indexes
// Its useless here, because we only have one key... see usefull examples on "examples/" folder
const pt = pt2json("my_key=my_value", { indexed: true }); // { "my_key": { "value": "my_value", "index": 0 } }

pt.my_key.value = "new value"; // Keep the index when converting back to plain text
pt.my_key.index = 10; // Change the index
pt.my_key = "new value"; // Legal but will destroy the index when converting back to plain text
```

## Read and write files

You can use pt2json with fs module:

```js
const fs = require("fs");

fs.readFile("./plain_text", "utf-8", (err, data) => {
    if (err) return;

    const jsonObj = pt2json(data);
    jsonObj.key = "value";

    fs.writeFileSync("./new_plain_text", json2pt(jsonObj));
});
```

## Author & License

Made by Baptiste Miquel under the MIT license.
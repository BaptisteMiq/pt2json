import { IndexedElement, NestedObject, Options } from "./objStructure";

let savedIndex = 0;
const createIndexedElement = (value: string): IndexedElement =>
({
    value,
    index: savedIndex++
});

const defaultOptions = {
    comments: true,
    emptyLines: true,
    tabs: false
};

/**
 * @description Converts a plain text file to a JSON object
 * @example 'parent key value' => {"parent":{"key":"value"}}
 * @example 'parent key "Hello World"' => {"parent":{"key":"\"Hello World\""}}
 * @param data Data to convert
 * @returns A JSON object of the converted plain text file
 */
export const pt2json = (data: string, _options: Options = defaultOptions): NestedObject => {

    const options = { ...defaultOptions, ..._options };

    const startsWithString = (str: string): boolean => {
        return str.startsWith('"') || str.startsWith("'") || str.startsWith('`');
    }

    const endsWithString = (str: string): boolean => {
        return str.endsWith('"') || str.endsWith("'") || str.endsWith('`');
    }

    const lines = data.split("\n");

    const createObj = (cRes: NestedObject, param: string, value: string) => {
        if (cRes[param] && !Array.isArray(cRes[param])) { // Param was a string (already seen), transform it to array
            const v = cRes[param];
            cRes[param] = [v, createIndexedElement(value)]; // Push existing string and current value
        } else if (Array.isArray(cRes[param])) { // Param is an array, push into it
            cRes[param].push(createIndexedElement(value));
        } else { // First time we see param, set as a string
            cRes[param] = createIndexedElement(value);
        }
    }

    const res: NestedObject = {};
    lines.forEach((l) => {

        // Comments
        const commentIndex = l.indexOf("#");
        if (commentIndex !== -1) {
            if (options.comments) {
                if (!res["__comments"]) {
                    res["__comments"] = [];
                }
                res.__comments.push(createIndexedElement(l));
            }
            return;
        }

        if(options.tabs) {
            l = l.trimRight();
        } else {
            l = l.trim();
        }

        // Undefined lines
        if (l === undefined || l === null) {
            return;
        }

        // Empty lines
        if (l === "") {
            if (options.emptyLines) {
                if (!res["__empty"]) {
                    res["__empty"] = [];
                }
                res.__empty.push(createIndexedElement(l));
            }
            return;
        }

        let params = l.split(" ");
        let newParams = [];

        const matches = [l.match(/\'/g), l.match(/\`/g), l.match(/\"/g)];
        const invalidStringCombo = matches.find((match) => {
            if (match) {
                return match.length % 2 !== 0;
            }
            return false;
        });

        // Complete valid string found
        // If VALID: key "Hello World" => {"key": "\"Hello World\""}
        // If INVALID: key "Hello World => {"key" { "\"Hello" : "World" }}
        if (!invalidStringCombo) {

            // TODO: Escape caracters

            for (let i = 0; i < params.length; i++) {
                const p = params[i];

                // Regroup ", ' and `
                if (startsWithString(p)) {
                    let currentParam = p;
                    for (let j = i + 1; j < params.length; j++) {
                        currentParam += " " + params[j]; // Add space because it was removed with split
                        i++;
                        if (endsWithString(params[j])) {
                            break;
                        }
                    }
                    newParams.push(`"${currentParam.slice(1, currentParam.length - 1)}"`);
                } else {
                    newParams.push(p);
                }
            }

            params = newParams;

        }

        // TODO: Make this recursive...
        switch (params.length) {
            case 1:
                res[params[0]] = null;
                break;
            case 2:
                createObj(res, params[0], params[1]);
                break;
            case 3:
                if (!res[params[0]]) {
                    res[params[0]] = {};
                }
                createObj(res[params[0]], params[1], params[2]);
                break;
            case 4:
                if (!res[params[0]]) {
                    res[params[0]] = {};
                }
                if (!res[params[0]][params[1]]) {
                    res[params[0]][params[1]] = {};
                }
                createObj(res[params[0]][params[1]], params[2], params[3]);
                break;
            default:
                if (!res["__misc"]) {
                    res["__misc"] = [];
                }
                res.__misc.push(createIndexedElement(l));
                break;
        }
    });

    return res;
};
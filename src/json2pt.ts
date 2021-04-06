import { IndexedElement, NestedObject, Options } from "./objStructure";

let options = {
    separator: "=",
    key_separator: " "
};

/**
 * @description Converts a JSON object to a plain text file
 * @example {"parent":{"key":"value"}} => 'parent key value'
 * @example {"parent":{"key":"\"Hello World\""}} => 'parent key "Hello World"'
 * @param data Data to convert
 * @returns A string of the converted json file
 */
export const json2pt = (data: NestedObject, _options: Options = options): string => {

    const usedOptions = { ...options, ..._options };

    // O(n) algorithm that flatten json
    function createBranch(result: Array<IndexedElement>, node: NestedObject, path?: string) {

        // Manage arrays
        const toTreat = Array.isArray(node) ? node : [node];
        toTreat.forEach((node) => {

            if (path === "__params") return;

            // Write the end of the branch or create a new branch
            const isObject = typeof (node) === "object";
            if (!isObject || node.value || node.value === false || node.value === "") {
                // Special cases for misc and comments:
                // Miscs are a set of keys / values that could not be treated by the algorithm
                // Comments are the list of comments in a separated array
                const resultValue = path === "__misc" || path === "__empty" || path === "__comments" ? "" : `${path}${usedOptions.separator}`;
                result.push({
                    value: `${resultValue}${isObject ? node.value : node}`,
                    index: node.index
                });
            } else {

                // Loop every key of a node
                Object.keys(node).forEach((key) => {

                    // Init or set the path
                    const nextPath = !path ? key : `${path}${usedOptions.key_separator}${key}`;

                    // Go to next branch
                    const nextNode = node[key];

                    // Write the end of the branch or create a new branch
                    const isObject = typeof (nextNode) === "object";
                    if (nextNode === null) {
                        console.log("Invalid format found for string", nextPath);
                        result.push({
                            value: nextPath,
                            index: 0
                        });
                        return;
                    };
                    if (!isObject || nextNode.value) {
                        result.push({
                            value: `${nextPath}${usedOptions.separator}${isObject ? nextNode.value : nextNode}`,
                            index: nextNode.index
                        });
                    } else {
                        createBranch(result, nextNode, nextPath);
                    }

                });
            }
        });
    }
    function branchesToArray(branches: Array<IndexedElement>) {
        const sortedBranches = branches.sort((a, b) => a.index - b.index);
        return sortedBranches.map((branch) => branch.value);
    }

    // Retrieve params
    if (data.__params) {
        options = { ...options, ...data.__params };
    }

    const resultBrch: Array<IndexedElement> = [];
    createBranch(resultBrch, data);
    // console.log(branchesToArray(resultBrch));

    let result = "";
    branchesToArray(resultBrch).map((r) => {
        result += `${r}\n`;
    });

    return result;

};
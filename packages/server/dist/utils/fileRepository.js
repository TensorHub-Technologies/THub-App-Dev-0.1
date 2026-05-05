"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFlowDataWithFilePaths = exports.containsBase64File = void 0;
const thub_components_1 = require("thub-components");
const containsBase64File = (chatflow) => {
    const parsedFlowData = JSON.parse(chatflow.flowData);
    const re = new RegExp('^data.*;base64', 'i');
    let found = false;
    const nodes = parsedFlowData.nodes;
    for (const node of nodes) {
        if (node.data.category !== 'Document Loaders') {
            continue;
        }
        const inputs = node.data.inputs;
        if (inputs) {
            const keys = Object.getOwnPropertyNames(inputs);
            for (let i = 0; i < keys.length; i++) {
                const input = inputs[keys[i]];
                if (!input) {
                    continue;
                }
                if (typeof input !== 'string') {
                    continue;
                }
                if (input.startsWith('[')) {
                    try {
                        const files = JSON.parse(input);
                        for (let j = 0; j < files.length; j++) {
                            const file = files[j];
                            if (re.test(file)) {
                                found = true;
                                break;
                            }
                        }
                    }
                    catch (e) {
                        continue;
                    }
                }
                if (re.test(input)) {
                    found = true;
                    break;
                }
            }
        }
    }
    return found;
};
exports.containsBase64File = containsBase64File;
const updateFlowDataWithFilePaths = async (chatflowid, flowData) => {
    try {
        const parsedFlowData = JSON.parse(flowData);
        const re = new RegExp('^data.*;base64', 'i');
        const nodes = parsedFlowData.nodes;
        for (let j = 0; j < nodes.length; j++) {
            const node = nodes[j];
            if (node.data.category !== 'Document Loaders') {
                continue;
            }
            if (node.data.inputs) {
                const inputs = node.data.inputs;
                const keys = Object.getOwnPropertyNames(inputs);
                for (let i = 0; i < keys.length; i++) {
                    const fileNames = [];
                    const key = keys[i];
                    const input = inputs?.[key];
                    if (!input) {
                        continue;
                    }
                    if (typeof input !== 'string') {
                        continue;
                    }
                    if (input.startsWith('[')) {
                        try {
                            const files = JSON.parse(input);
                            for (let j = 0; j < files.length; j++) {
                                const file = files[j];
                                if (re.test(file)) {
                                    node.data.inputs[key] = await (0, thub_components_1.addBase64FilesToStorage)(file, chatflowid, fileNames);
                                }
                            }
                        }
                        catch (e) {
                            continue;
                        }
                    }
                    else if (re.test(input)) {
                        node.data.inputs[key] = await (0, thub_components_1.addBase64FilesToStorage)(input, chatflowid, fileNames);
                    }
                }
            }
        }
        return JSON.stringify(parsedFlowData);
    }
    catch (e) {
        return '';
    }
};
exports.updateFlowDataWithFilePaths = updateFlowDataWithFilePaths;
//# sourceMappingURL=fileRepository.js.map
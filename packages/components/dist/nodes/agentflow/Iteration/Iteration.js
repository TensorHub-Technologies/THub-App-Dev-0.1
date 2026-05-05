"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Iteration_Agentflow {
    label;
    name;
    version;
    description;
    type;
    icon;
    category;
    color;
    baseClasses;
    documentation;
    credential;
    inputs;
    constructor() {
        this.label = 'Iteration';
        this.name = 'iterationAgentflow';
        this.version = 1.0;
        this.type = 'Iteration';
        this.category = 'Agent Studio';
        this.description = 'Execute the nodes within the iteration block through N iterations';
        this.baseClasses = [this.type];
        this.color = '#9C89B8';
        this.inputs = [
            {
                label: 'Array Input',
                name: 'iterationInput',
                type: 'string',
                description: 'The input array to iterate over',
                acceptVariable: true,
                rows: 4
            }
        ];
    }
    async run(nodeData, _, options) {
        const iterationInput = nodeData.inputs?.iterationInput;
        // Helper function to clean JSON strings with redundant backslashes
        const safeParseJson = (str) => {
            try {
                return JSON.parse(str);
            }
            catch {
                // Try parsing after cleaning
                return JSON.parse(str.replace(/\\(["'[\]{}])/g, '$1'));
            }
        };
        const iterationInputArray = typeof iterationInput === 'string' && iterationInput !== '' ? safeParseJson(iterationInput) : iterationInput;
        if (!iterationInputArray || !Array.isArray(iterationInputArray)) {
            throw new Error('Invalid input array');
        }
        const state = options.agentflowRuntime?.state;
        const returnOutput = {
            id: nodeData.id,
            name: this.name,
            input: {
                iterationInput: iterationInputArray
            },
            output: {},
            state
        };
        return returnOutput;
    }
}
module.exports = { nodeClass: Iteration_Agentflow };
//# sourceMappingURL=Iteration.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ChatflowApi {
    label;
    name;
    version;
    inputs;
    constructor() {
        this.label = 'Workflow API';
        this.name = 'chatflowApi';
        this.version = 1.0;
        this.inputs = [
            {
                label: 'Workflow Api Key',
                name: 'chatflowApiKey',
                type: 'password'
            }
        ];
    }
}
module.exports = { credClass: ChatflowApi };
//# sourceMappingURL=ChatflowApi.credential.js.map
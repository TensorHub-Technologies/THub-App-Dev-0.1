"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StickyNote_Agentflow {
    label;
    name;
    version;
    description;
    type;
    icon;
    category;
    color;
    tags;
    baseClasses;
    inputs;
    constructor() {
        this.label = 'Sticky Note';
        this.name = 'stickyNoteAgentflow';
        this.version = 1.0;
        this.type = 'StickyNote';
        this.color = '#fee440';
        this.category = 'Agent Studio';
        this.description = 'Add notes to the agent flow';
        this.inputs = [
            {
                label: '',
                name: 'note',
                type: 'string',
                rows: 1,
                placeholder: 'Type something here',
                optional: true
            }
        ];
        this.baseClasses = [this.type];
    }
    async run() {
        return undefined;
    }
}
module.exports = { nodeClass: StickyNote_Agentflow };
//# sourceMappingURL=StickyNote.js.map
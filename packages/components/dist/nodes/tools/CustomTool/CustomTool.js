"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const core_1 = require("./core");
const zod_1 = require("zod");
const secureZodParser_1 = require("../../../src/secureZodParser");
class CustomTool_Tools {
    label;
    name;
    version;
    description;
    type;
    icon;
    category;
    baseClasses;
    inputs;
    constructor() {
        this.label = 'Custom Tool';
        this.name = 'customTool';
        this.version = 3.0;
        this.type = 'CustomTool';
        this.icon = 'customtool.svg';
        this.category = 'Tools';
        this.description = `Use custom tool you've created in THub within chatflow`;
        this.inputs = [
            {
                label: 'Select Tool',
                name: 'selectedTool',
                type: 'asyncOptions',
                loadMethod: 'listTools'
            },
            {
                label: 'Return Direct',
                name: 'returnDirect',
                description: 'Return the output of the tool directly to the user',
                type: 'boolean',
                optional: true
            },
            {
                label: 'Custom Tool Name',
                name: 'customToolName',
                type: 'string',
                hidden: true
            },
            {
                label: 'Custom Tool Description',
                name: 'customToolDesc',
                type: 'string',
                hidden: true
            },
            {
                label: 'Custom Tool Schema',
                name: 'customToolSchema',
                type: 'string',
                hidden: true
            },
            {
                label: 'Custom Tool Func',
                name: 'customToolFunc',
                type: 'string',
                hidden: true
            }
        ];
        this.baseClasses = [this.type, 'Tool', ...(0, utils_1.getBaseClasses)(core_1.DynamicStructuredTool)];
    }
    //@ts-ignore
    loadMethods = {
        async listTools(_, options) {
            const returnData = [];
            const appDataSource = options.appDataSource;
            const databaseEntities = options.databaseEntities;
            if (appDataSource === undefined || !appDataSource) {
                return returnData;
            }
            const searchOptions = options.searchOptions || {};
            let tenantId = options.tenantId;
            try {
                // Fix: Use proper object syntax for findBy with tenantId
                const whereClause = tenantId ? { tenantId: tenantId } : {};
                const tools = await appDataSource.getRepository(databaseEntities['Tool']).findBy(whereClause);
                for (let i = 0; i < tools.length; i += 1) {
                    const data = {
                        label: tools[i].name,
                        name: tools[i].id,
                        description: tools[i].description
                    };
                    returnData.push(data);
                }
            }
            catch (error) {
                console.error('Error fetching tools by tenantId:', error);
                // Return empty array on error to prevent breaking the UI
            }
            return returnData;
        }
    };
    async init(nodeData, _, options) {
        const selectedToolId = nodeData.inputs?.selectedTool;
        const customToolFunc = nodeData.inputs?.customToolFunc;
        const customToolName = nodeData.inputs?.customToolName;
        const customToolDesc = nodeData.inputs?.customToolDesc;
        const customToolSchema = nodeData.inputs?.customToolSchema;
        const customToolReturnDirect = nodeData.inputs?.returnDirect;
        const appDataSource = options.appDataSource;
        const databaseEntities = options.databaseEntities;
        try {
            // Also fix the tool fetching in init method to include tenantId if needed
            const tenantId = options.tenantId;
            const whereClause = { id: selectedToolId };
            // If tenantId exists, add it to the where clause for additional security
            if (tenantId) {
                whereClause.tenantId = tenantId;
            }
            const tool = await appDataSource.getRepository(databaseEntities['Tool']).findOneBy(whereClause);
            if (!tool)
                throw new Error(`Tool ${selectedToolId} not found`);
            const obj = {
                name: tool.name,
                description: tool.description,
                schema: zod_1.z.object((0, utils_1.convertSchemaToZod)(tool.schema)),
                code: tool.func
            };
            if (customToolFunc)
                obj.code = customToolFunc;
            if (customToolName)
                obj.name = customToolName;
            if (customToolDesc)
                obj.description = customToolDesc;
            if (customToolSchema) {
                obj.schema = secureZodParser_1.SecureZodSchemaParser.parseZodSchema(customToolSchema);
            }
            const variables = await (0, utils_1.getVars)(appDataSource, databaseEntities, nodeData, options);
            const flow = { chatflowId: options.chatflowid };
            let dynamicStructuredTool = new core_1.DynamicStructuredTool(obj);
            dynamicStructuredTool.setVariables(variables);
            dynamicStructuredTool.setFlowObject(flow);
            dynamicStructuredTool.returnDirect = customToolReturnDirect;
            return dynamicStructuredTool;
        }
        catch (e) {
            throw new Error(e);
        }
    }
}
module.exports = { nodeClass: CustomTool_Tools };
//# sourceMappingURL=CustomTool.js.map
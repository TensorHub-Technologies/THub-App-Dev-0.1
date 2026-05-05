"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const export_import_1 = __importDefault(require("../../services/export-import"));
const assignTenantOwnership = (payload, tenantId) => {
    const tenantScopedCollections = [
        'AgentFlow',
        'AgentFlowV2',
        'AssistantCustom',
        'AssistantFlow',
        'AssistantOpenAI',
        'AssistantAzure',
        'ChatFlow',
        'DocumentStore',
        'Execution',
        'Tool',
        'Variable'
    ];
    for (const key of tenantScopedCollections) {
        if (!Array.isArray(payload[key]))
            continue;
        payload[key] = payload[key].map((item) => ({
            ...item,
            tenantId
        }));
    }
    return payload;
};
const exportData = async (req, res, next) => {
    try {
        const tenantId = req.user?.id;
        if (!tenantId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const exportInput = export_import_1.default.convertExportInput(req.body);
        const apiResponse = await export_import_1.default.exportData(exportInput, tenantId);
        return res.json(apiResponse);
    }
    catch (error) {
        next(error);
    }
};
const importData = async (req, res, next) => {
    try {
        const tenantId = req.user?.id;
        if (!tenantId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const importData = assignTenantOwnership({ ...req.body }, tenantId);
        await export_import_1.default.importData(importData);
        return res.json({ message: 'success' });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    exportData,
    importData
};
//# sourceMappingURL=index.js.map
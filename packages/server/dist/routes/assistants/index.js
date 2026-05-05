"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const assistants_1 = __importDefault(require("../../controllers/assistants"));
const authorizeResource_1 = __importDefault(require("../../middlewares/authorizeResource"));
const Assistant_1 = require("../../database/entities/Assistant");
const getRunningExpressApp_1 = require("../../utils/getRunningExpressApp");
const router = express_1.default.Router();
const getAssistantByIdFromDB = async (id) => {
    if (!id)
        return null;
    const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
    return await appServer.AppDataSource.getRepository(Assistant_1.Assistant).findOneBy({ id });
};
// CREATE
router.post('/', assistants_1.default.createAssistant);
// READ
router.get('/', assistants_1.default.getAllAssistants);
router.get('/:id', assistants_1.default.getAllAssistants);
router.get('/getAssistantById/:id', (0, authorizeResource_1.default)((req) => getAssistantByIdFromDB(req.params.id), {
    notFoundMessage: 'Assistant not found',
    forbiddenMessage: 'You are not allowed to access this assistant'
}), assistants_1.default.getAssistantById);
// UPDATE
router.put('/:id', (0, authorizeResource_1.default)((req) => getAssistantByIdFromDB(req.params.id), {
    notFoundMessage: 'Assistant not found',
    forbiddenMessage: 'You are not allowed to update this assistant'
}), assistants_1.default.updateAssistant);
// DELETE
router.delete('/:id', (0, authorizeResource_1.default)((req) => getAssistantByIdFromDB(req.params.id), {
    notFoundMessage: 'Assistant not found',
    forbiddenMessage: 'You are not allowed to delete this assistant'
}), assistants_1.default.deleteAssistant);
router.get('/components/chatmodels', assistants_1.default.getChatModels);
router.get('/components/docstores', assistants_1.default.getDocumentStores);
router.get('/components/tools', assistants_1.default.getTools);
// Generate Assistant Instruction
router.post('/generate/instruction', assistants_1.default.generateAssistantInstruction);
exports.default = router;
//# sourceMappingURL=index.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatflows_1 = __importDefault(require("../../controllers/chatflows"));
const authorizeResource_1 = __importDefault(require("../../middlewares/authorizeResource"));
const ChatFlow_1 = require("../../database/entities/ChatFlow");
const getRunningExpressApp_1 = require("../../utils/getRunningExpressApp");
const router = express_1.default.Router();
const getChatflowByIdFromDB = async (id) => {
    if (!id)
        return null;
    const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
    return await appServer.AppDataSource.getRepository(ChatFlow_1.ChatFlow).findOneBy({ id });
};
// CREATE
router.post('/', chatflows_1.default.saveChatflow);
router.post('/importchatflows', chatflows_1.default.importChatflows);
// READ
router.get('/', chatflows_1.default.getAllChatflows);
router.get('/:id', (0, authorizeResource_1.default)((req) => getChatflowByIdFromDB(req.params.id), {
    notFoundMessage: 'Workflow not found',
    forbiddenMessage: 'You are not allowed to access this workflow'
}), chatflows_1.default.getChatflowById);
// UPDATE
router.put('/:id', (0, authorizeResource_1.default)((req) => getChatflowByIdFromDB(req.params.id), {
    notFoundMessage: 'Workflow not found',
    forbiddenMessage: 'You are not allowed to update this workflow'
}), chatflows_1.default.updateChatflow);
// DELETE
router.delete('/:id', (0, authorizeResource_1.default)((req) => getChatflowByIdFromDB(req.params.id), {
    notFoundMessage: 'Workflow not found',
    forbiddenMessage: 'You are not allowed to delete this workflow'
}), chatflows_1.default.deleteChatflow);
exports.default = router;
//# sourceMappingURL=index.js.map
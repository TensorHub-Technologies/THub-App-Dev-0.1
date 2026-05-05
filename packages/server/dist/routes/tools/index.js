"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tools_1 = __importDefault(require("../../controllers/tools"));
const authorizeResource_1 = __importDefault(require("../../middlewares/authorizeResource"));
const Tool_1 = require("../../database/entities/Tool");
const getRunningExpressApp_1 = require("../../utils/getRunningExpressApp");
const router = express_1.default.Router();
const getToolByIdFromDB = async (id) => {
    if (!id)
        return null;
    const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
    return await appServer.AppDataSource.getRepository(Tool_1.Tool).findOneBy({ id });
};
// CREATE
router.post('/', tools_1.default.createTool);
// READ
router.get('/', tools_1.default.getAllTools);
router.get('/:id', tools_1.default.getAllTools);
router.get('/getToolById/:id', (0, authorizeResource_1.default)((req) => getToolByIdFromDB(req.params.id), {
    notFoundMessage: 'Tool not found',
    forbiddenMessage: 'You are not allowed to access this tool'
}), tools_1.default.getToolById);
// UPDATE
router.put('/:id', (0, authorizeResource_1.default)((req) => getToolByIdFromDB(req.params.id), {
    notFoundMessage: 'Tool not found',
    forbiddenMessage: 'You are not allowed to update this tool'
}), tools_1.default.updateTool);
// DELETE
router.delete('/:id', (0, authorizeResource_1.default)((req) => getToolByIdFromDB(req.params.id), {
    notFoundMessage: 'Tool not found',
    forbiddenMessage: 'You are not allowed to delete this tool'
}), tools_1.default.deleteTool);
exports.default = router;
//# sourceMappingURL=index.js.map
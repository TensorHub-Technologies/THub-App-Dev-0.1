"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const variables_1 = __importDefault(require("../../controllers/variables"));
const authorizeResource_1 = __importDefault(require("../../middlewares/authorizeResource"));
const Variable_1 = require("../../database/entities/Variable");
const getRunningExpressApp_1 = require("../../utils/getRunningExpressApp");
const router = express_1.default.Router();
const getVariableByIdFromDB = async (id) => {
    if (!id)
        return null;
    const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
    return await appServer.AppDataSource.getRepository(Variable_1.Variable).findOneBy({ id });
};
// CREATE
router.post('/', variables_1.default.createVariable);
// READ
router.get('/', variables_1.default.getAllVariables);
router.get('/:id', variables_1.default.getAllVariables);
// UPDATE
router.put('/:id', (0, authorizeResource_1.default)((req) => getVariableByIdFromDB(req.params.id), {
    notFoundMessage: 'Variable not found',
    forbiddenMessage: 'You are not allowed to update this variable'
}), variables_1.default.updateVariable);
// DELETE
router.delete('/:id', (0, authorizeResource_1.default)((req) => getVariableByIdFromDB(req.params.id), {
    notFoundMessage: 'Variable not found',
    forbiddenMessage: 'You are not allowed to delete this variable'
}), variables_1.default.deleteVariable);
exports.default = router;
//# sourceMappingURL=index.js.map
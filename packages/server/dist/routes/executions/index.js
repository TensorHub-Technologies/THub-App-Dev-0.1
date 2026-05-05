"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const executions_1 = __importDefault(require("../../controllers/executions"));
const authorizeResource_1 = __importDefault(require("../../middlewares/authorizeResource"));
const Execution_1 = require("../../database/entities/Execution");
const getRunningExpressApp_1 = require("../../utils/getRunningExpressApp");
const router = express_1.default.Router();
const getExecutionByIdFromDB = async (id) => {
    if (!id)
        return null;
    const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
    return await appServer.AppDataSource.getRepository(Execution_1.Execution).findOneBy({ id });
};
// READ
router.get('/', executions_1.default.getAllExecutions);
router.get('/:id', (0, authorizeResource_1.default)((req) => getExecutionByIdFromDB(req.params.id), {
    notFoundMessage: 'Execution not found',
    forbiddenMessage: 'You are not allowed to access this execution'
}), executions_1.default.getExecutionById);
// PUT
router.put('/:id', (0, authorizeResource_1.default)((req) => getExecutionByIdFromDB(req.params.id), {
    notFoundMessage: 'Execution not found',
    forbiddenMessage: 'You are not allowed to update this execution'
}), executions_1.default.updateExecution);
// DELETE - single execution or multiple executions
router.delete('/:id', (0, authorizeResource_1.default)((req) => getExecutionByIdFromDB(req.params.id), {
    notFoundMessage: 'Execution not found',
    forbiddenMessage: 'You are not allowed to delete this execution'
}), executions_1.default.deleteExecutions);
router.delete('/', executions_1.default.deleteExecutions);
exports.default = router;
//# sourceMappingURL=index.js.map
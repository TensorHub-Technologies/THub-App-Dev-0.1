"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const evaluators_1 = __importDefault(require("../../controllers/evaluators"));
const authorizeResource_1 = __importDefault(require("../../middlewares/authorizeResource"));
const Evaluator_1 = require("../../database/entities/Evaluator");
const getRunningExpressApp_1 = require("../../utils/getRunningExpressApp");
const router = express_1.default.Router();
const getEvaluatorByIdFromDB = async (id) => {
    if (!id)
        return null;
    const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
    return await appServer.AppDataSource.getRepository(Evaluator_1.Evaluator).findOneBy({ id });
};
router.get('/', evaluators_1.default.getAllEvaluators);
router.get('/:id', (0, authorizeResource_1.default)((req) => getEvaluatorByIdFromDB(req.params.id), {
    notFoundMessage: 'Evaluator not found',
    forbiddenMessage: 'You are not allowed to access this evaluator'
}), evaluators_1.default.getEvaluator);
router.post('/', evaluators_1.default.createEvaluator);
router.put('/:id', (0, authorizeResource_1.default)((req) => getEvaluatorByIdFromDB(req.params.id), {
    notFoundMessage: 'Evaluator not found',
    forbiddenMessage: 'You are not allowed to update this evaluator'
}), evaluators_1.default.updateEvaluator);
router.delete('/:id', (0, authorizeResource_1.default)((req) => getEvaluatorByIdFromDB(req.params.id), {
    notFoundMessage: 'Evaluator not found',
    forbiddenMessage: 'You are not allowed to delete this evaluator'
}), evaluators_1.default.deleteEvaluator);
exports.default = router;
//# sourceMappingURL=index.js.map
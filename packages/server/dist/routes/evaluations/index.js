"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const evaluations_1 = __importDefault(require("../../controllers/evaluations"));
const authorizeResource_1 = __importDefault(require("../../middlewares/authorizeResource"));
const Evaluation_1 = require("../../database/entities/Evaluation");
const getRunningExpressApp_1 = require("../../utils/getRunningExpressApp");
const router = express_1.default.Router();
const getEvaluationByIdFromDB = async (id) => {
    if (!id)
        return null;
    const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
    return await appServer.AppDataSource.getRepository(Evaluation_1.Evaluation).findOneBy({ id });
};
router.get('/', evaluations_1.default.getAllEvaluations);
router.post('/', evaluations_1.default.createEvaluation);
router.get('/:id', (0, authorizeResource_1.default)((req) => getEvaluationByIdFromDB(req.params.id), {
    notFoundMessage: 'Evaluation not found',
    forbiddenMessage: 'You are not allowed to access this evaluation'
}), evaluations_1.default.getEvaluation);
router.delete('/:id', (0, authorizeResource_1.default)((req) => getEvaluationByIdFromDB(req.params.id), {
    notFoundMessage: 'Evaluation not found',
    forbiddenMessage: 'You are not allowed to delete this evaluation'
}), evaluations_1.default.deleteEvaluation);
router.get('/is-outdated/:id', (0, authorizeResource_1.default)((req) => getEvaluationByIdFromDB(req.params.id), {
    notFoundMessage: 'Evaluation not found',
    forbiddenMessage: 'You are not allowed to access this evaluation'
}), evaluations_1.default.isOutdated);
router.post('/run-again/:id', (0, authorizeResource_1.default)((req) => getEvaluationByIdFromDB(req.params.id), {
    notFoundMessage: 'Evaluation not found',
    forbiddenMessage: 'You are not allowed to rerun this evaluation'
}), evaluations_1.default.runAgain);
router.get('/versions/:id', (0, authorizeResource_1.default)((req) => getEvaluationByIdFromDB(req.params.id), {
    notFoundMessage: 'Evaluation not found',
    forbiddenMessage: 'You are not allowed to access this evaluation'
}), evaluations_1.default.getVersions);
router.patch('/', evaluations_1.default.patchDeleteEvaluations);
exports.default = router;
//# sourceMappingURL=index.js.map
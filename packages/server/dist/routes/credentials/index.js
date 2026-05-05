"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const credentials_1 = __importDefault(require("../../controllers/credentials"));
const authorizeResource_1 = __importDefault(require("../../middlewares/authorizeResource"));
const Credential_1 = require("../../database/entities/Credential");
const getRunningExpressApp_1 = require("../../utils/getRunningExpressApp");
const router = express_1.default.Router();
const getCredentialByIdFromDB = async (id) => {
    if (!id)
        return null;
    const appServer = (0, getRunningExpressApp_1.getRunningExpressApp)();
    return await appServer.AppDataSource.getRepository(Credential_1.Credential).findOneBy({ id });
};
// CREATE
router.post('/', credentials_1.default.createCredential);
// READ
router.get('/', credentials_1.default.getAllCredentials);
router.get('/:id', (0, authorizeResource_1.default)((req) => getCredentialByIdFromDB(req.params.id), {
    notFoundMessage: 'Credential not found',
    forbiddenMessage: 'You are not allowed to access this credential'
}), credentials_1.default.getCredentialById);
// UPDATE
router.put('/:id', (0, authorizeResource_1.default)((req) => getCredentialByIdFromDB(req.params.id), {
    notFoundMessage: 'Credential not found',
    forbiddenMessage: 'You are not allowed to update this credential'
}), credentials_1.default.updateCredential);
// DELETE
router.delete('/:id', (0, authorizeResource_1.default)((req) => getCredentialByIdFromDB(req.params.id), {
    notFoundMessage: 'Credential not found',
    forbiddenMessage: 'You are not allowed to delete this credential'
}), credentials_1.default.deleteCredentials);
exports.default = router;
//# sourceMappingURL=index.js.map
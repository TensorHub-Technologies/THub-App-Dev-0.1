"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscription_1 = __importDefault(require("../../controllers/subscription"));
const router = express_1.default.Router();
router.post('/create', subscription_1.default.createSubscription);
router.post('/validate', subscription_1.default.validateSubscription);
router.post('/activate-free', subscription_1.default.activateFreeSubscription);
router.post('/enterprise-mail', subscription_1.default.submitEnterpriseMail);
router.get('/enterprise-mail', subscription_1.default.enterpriseMailStatus);
exports.default = router;
//# sourceMappingURL=index.js.map
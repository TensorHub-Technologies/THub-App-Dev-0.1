"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscription_1 = __importDefault(require("../../controllers/subscription"));
const router = express_1.default.Router();
// Backward compatibility for existing UI calls.
router.post('/create-subscription', subscription_1.default.createSubscription);
router.post('/validate-subscription', subscription_1.default.validateSubscription);
router.post('/activate-free-subscription', subscription_1.default.activateFreeSubscription);
router.post('/enterprice-mail', subscription_1.default.submitEnterpriseMail);
router.get('/enterprice-mail', subscription_1.default.enterpriseMailStatus);
router.post('/enterprise-mail', subscription_1.default.submitEnterpriseMail);
router.get('/enterprise-mail', subscription_1.default.enterpriseMailStatus);
router.post('/api/subscription/create', subscription_1.default.createSubscription);
router.post('/api/subscription/validate', subscription_1.default.validateSubscription);
router.post('/api/subscription/activate-free', subscription_1.default.activateFreeSubscription);
router.post('/api/subscription/enterprise-mail', subscription_1.default.submitEnterpriseMail);
router.get('/api/subscription/enterprise-mail', subscription_1.default.enterpriseMailStatus);
exports.default = router;
//# sourceMappingURL=index.js.map
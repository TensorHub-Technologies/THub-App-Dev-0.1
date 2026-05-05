"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Execution = void 0;
const typeorm_1 = require("typeorm");
const ChatFlow_1 = require("./ChatFlow");
let Execution = class Execution {
};
exports.Execution = Execution;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Execution.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'longtext',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        //doing falsi because it was downloading the files before making chat history loding time long
        select: false
    }),
    __metadata("design:type", String)
], Execution.prototype, "executionData", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50
    }),
    __metadata("design:type", String)
], Execution.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Execution.prototype, "agentflowId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ChatFlow_1.ChatFlow),
    (0, typeorm_1.JoinColumn)({ name: 'agentflowId' }),
    __metadata("design:type", ChatFlow_1.ChatFlow
    /* ================= SESSION ================= */
    )
], Execution.prototype, "agentflow", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci'
    }),
    __metadata("design:type", String)
], Execution.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci'
    }),
    __metadata("design:type", String)
], Execution.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Boolean)
], Execution.prototype, "isPublic", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Execution.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Execution.prototype, "total_tokens", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Execution.prototype, "agentTokens", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Execution.prototype, "total_time", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Execution.prototype, "createdDate", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Execution.prototype, "updatedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Execution.prototype, "stoppedDate", void 0);
exports.Execution = Execution = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Index)('IDX_EXECUTION_SESSION_AGENTFLOW', ['sessionId', 'agentflowId', 'createdDate'])
], Execution);
//# sourceMappingURL=Execution.js.map
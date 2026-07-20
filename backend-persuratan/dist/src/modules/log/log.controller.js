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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogController = void 0;
const common_1 = require("@nestjs/common");
const log_service_1 = require("./log.service");
const jwt_auth_guard_1 = require("../../core/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let LogController = class LogController {
    logService;
    constructor(logService) {
        this.logService = logService;
    }
    async findAll(limit) {
        const l = limit ? parseInt(limit, 10) : 100;
        return this.logService.findAll(l);
    }
};
exports.LogController = LogController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "findAll", null);
exports.LogController = LogController = __decorate([
    (0, swagger_1.ApiTags)('Log'),
    (0, common_1.Controller)('log'),
    __metadata("design:paramtypes", [log_service_1.LogService])
], LogController);
//# sourceMappingURL=log.controller.js.map
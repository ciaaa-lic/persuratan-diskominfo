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
exports.StokController = void 0;
const common_1 = require("@nestjs/common");
const stok_service_1 = require("./stok.service");
const jwt_auth_guard_1 = require("../../core/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let StokController = class StokController {
    stokService;
    constructor(stokService) {
        this.stokService = stokService;
    }
    async getSummary(tanggal) {
        const targetDateStr = tanggal || new Date().toISOString().split('T')[0];
        return this.stokService.getStokSummary(targetDateStr);
    }
};
exports.StokController = StokController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)('tanggal')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StokController.prototype, "getSummary", null);
exports.StokController = StokController = __decorate([
    (0, swagger_1.ApiTags)('Stok'),
    (0, common_1.Controller)('stok'),
    __metadata("design:paramtypes", [stok_service_1.StokService])
], StokController);
//# sourceMappingURL=stok.controller.js.map
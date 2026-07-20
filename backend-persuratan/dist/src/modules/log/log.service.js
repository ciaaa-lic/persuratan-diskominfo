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
exports.LogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
let LogService = class LogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(limit = 100) {
        return this.prisma.activityLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async createLog(params) {
        return this.prisma.activityLog.create({
            data: {
                userId: params.userId,
                userName: params.userName,
                role: params.role,
                action: params.action,
                description: params.description,
            },
        });
    }
};
exports.LogService = LogService;
exports.LogService = LogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LogService);
//# sourceMappingURL=log.service.js.map
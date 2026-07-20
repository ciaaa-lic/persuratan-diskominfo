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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const stok_service_1 = require("../stok/stok.service");
let DashboardService = class DashboardService {
    prisma;
    stokService;
    constructor(prisma, stokService) {
        this.prisma = prisma;
        this.stokService = stokService;
    }
    async getStats() {
        const todayStr = new Date().toISOString().split('T')[0];
        const stokSummary = await this.stokService.getStokSummary(todayStr);
        const now = new Date();
        const todayStart = new Date(`${todayStr}T00:00:00.000Z`);
        const todayEnd = new Date(`${todayStr}T23:59:59.999Z`);
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const [pengajuanHariIni, menungguHariIni, selesaiHariIni, masukBulanIni, keluarBulanIni] = await Promise.all([
            this.prisma.pengajuanSurat.count({
                where: { tanggalPengajuan: { gte: todayStart, lte: todayEnd } },
            }),
            this.prisma.pengajuanSurat.count({
                where: { status: 'Menunggu' },
            }),
            this.prisma.pengajuanSurat.count({
                where: { status: 'Selesai', tanggalPengajuan: { gte: todayStart, lte: todayEnd } },
            }),
            this.prisma.pengajuanSurat.count({
                where: { tanggalPengajuan: { gte: firstDayOfMonth, lte: lastDayOfMonth } },
            }),
            this.prisma.nomorTerpakai.count({
                where: { assignedAt: { gte: firstDayOfMonth, lte: lastDayOfMonth } },
            }),
        ]);
        return {
            workingDayIndex: stokSummary.workingDayIndex,
            numberRange: stokSummary.numberRange,
            stokSummary,
            hariIni: {
                pengajuan: pengajuanHariIni,
                menunggu: menungguHariIni,
                selesai: selesaiHariIni,
            },
            bulanIni: {
                masuk: masukBulanIni,
                keluar: keluarBulanIni,
                terpakai: keluarBulanIni,
            },
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stok_service_1.StokService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map
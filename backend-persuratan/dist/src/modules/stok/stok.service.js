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
exports.StokService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const client_1 = require("@prisma/client");
let StokService = class StokService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWorkingDaysCount(targetDateStr) {
        const [yearStr, monthStr, dayStr] = targetDateStr.split('-');
        const year = Number(yearStr);
        const month = Number(monthStr);
        const day = Number(dayStr);
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            return 1;
        }
        const liburList = await this.prisma.hariLiburNasional.findMany({
            where: {
                tanggal: {
                    gte: new Date(`${year}-01-01T00:00:00.000Z`),
                    lte: new Date(`${year}-12-31T23:59:59.999Z`),
                },
            },
            select: { tanggal: true },
        });
        const liburSet = new Set(liburList.map((item) => item.tanggal.toISOString().split('T')[0]));
        let workingDays = 0;
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, month - 1, day);
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dt = String(d.getDate()).padStart(2, '0');
            const dateString = `${y}-${m}-${dt}`;
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                continue;
            }
            if (liburSet.has(dateString)) {
                continue;
            }
            workingDays++;
        }
        return Math.max(1, workingDays);
    }
    getDailyNumberRange(workingDayIndex) {
        const start = (workingDayIndex - 1) * 40 + 1;
        const end = workingDayIndex * 40;
        return { start, end };
    }
    async ensureAndGetAvailableStock(targetDateStr) {
        const targetDate = new Date(`${targetDateStr}T00:00:00.000Z`);
        const workingDayIndex = await this.getWorkingDaysCount(targetDateStr);
        const { start: startNum, end: endNum } = this.getDailyNumberRange(workingDayIndex);
        const countCheck = await this.prisma.nomorStok.count({
            where: {
                tanggal: targetDate,
                urutan: { gte: startNum, lte: endNum },
            },
        });
        if (countCheck === 0) {
            const createData = [];
            for (let u = startNum; u <= endNum; u++) {
                createData.push({
                    tanggal: targetDate,
                    urutan: u,
                    suffix: '',
                    nomorFullStok: `${u}`,
                    status: client_1.NomorStokStatus.tersedia,
                });
            }
            await this.prisma.nomorStok.createMany({
                data: createData,
                skipDuplicates: true,
            });
        }
        let stokRow = await this.prisma.nomorStok.findFirst({
            where: {
                tanggal: targetDate,
                urutan: { gte: startNum, lte: endNum },
                status: client_1.NomorStokStatus.tersedia,
            },
            orderBy: { id: 'asc' },
        });
        if (!stokRow) {
            const lastSuffRow = await this.prisma.nomorStok.findFirst({
                where: {
                    tanggal: targetDate,
                    urutan: { gte: startNum, lte: endNum },
                },
                orderBy: { id: 'desc' },
            });
            const lastSuff = lastSuffRow ? lastSuffRow.suffix : '';
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let nextSuff = 'A';
            if (lastSuff !== '') {
                const pos = alphabet.indexOf(lastSuff);
                if (pos !== -1 && pos < 25) {
                    nextSuff = alphabet[pos + 1];
                }
                else {
                    nextSuff = 'Z';
                }
            }
            const createSuffixData = [];
            for (let u = startNum; u <= endNum; u++) {
                createSuffixData.push({
                    tanggal: targetDate,
                    urutan: u,
                    suffix: nextSuff,
                    nomorFullStok: `${u}.${nextSuff}`,
                    status: client_1.NomorStokStatus.tersedia,
                });
            }
            await this.prisma.nomorStok.createMany({
                data: createSuffixData,
                skipDuplicates: true,
            });
            stokRow = await this.prisma.nomorStok.findFirst({
                where: {
                    tanggal: targetDate,
                    urutan: { gte: startNum, lte: endNum },
                    status: client_1.NomorStokStatus.tersedia,
                },
                orderBy: { id: 'asc' },
            });
        }
        return {
            stokRow,
            workingDayIndex,
            startNum,
            endNum,
        };
    }
    async getStokSummary(targetDateStr) {
        const targetDate = new Date(`${targetDateStr}T00:00:00.000Z`);
        const workingDayIndex = await this.getWorkingDaysCount(targetDateStr);
        const { start: startNum, end: endNum } = this.getDailyNumberRange(workingDayIndex);
        await this.ensureAndGetAvailableStock(targetDateStr);
        const stokList = await this.prisma.nomorStok.findMany({
            where: {
                tanggal: targetDate,
                urutan: { gte: startNum, lte: endNum },
            },
        });
        const suffixMap = {};
        for (const row of stokList) {
            const suff = row.suffix;
            if (!suffixMap[suff]) {
                suffixMap[suff] = { total: 0, used: 0 };
            }
            suffixMap[suff].total++;
            if (row.status === client_1.NomorStokStatus.terpakai) {
                suffixMap[suff].used++;
            }
        }
        const groups = Object.keys(suffixMap)
            .sort()
            .map((suff) => ({
            suffix: suff,
            total: suffixMap[suff].total,
            used: suffixMap[suff].used,
        }));
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const totalTerpakai = await this.prisma.nomorTerpakai.count({
            where: {
                assignedAt: {
                    gte: targetDate,
                    lt: nextDay,
                },
            },
        });
        return {
            tanggal: targetDateStr,
            workingDayIndex,
            numberRange: `${startNum} - ${endNum}`,
            totalTerpakai,
            groups,
        };
    }
};
exports.StokService = StokService;
exports.StokService = StokService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StokService);
//# sourceMappingURL=stok.service.js.map
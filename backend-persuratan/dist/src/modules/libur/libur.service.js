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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiburService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const date_holidays_1 = __importDefault(require("date-holidays"));
let LiburService = class LiburService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        const currentYear = new Date().getFullYear();
        console.log('[LiburService] Auto-syncing public holidays...');
        for (let y = currentYear - 3; y <= currentYear + 5; y++) {
            await this.sync(y);
        }
        console.log('[LiburService] Public holidays synced.');
    }
    async findAll(year) {
        if (year) {
            const startDate = new Date(`${year}-01-01`);
            const endDate = new Date(`${year}-12-31`);
            return this.prisma.hariLiburNasional.findMany({
                where: {
                    tanggal: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                orderBy: { tanggal: 'asc' },
            });
        }
        return this.prisma.hariLiburNasional.findMany({
            orderBy: { tanggal: 'asc' },
        });
    }
    async create(tanggalStr, keterangan) {
        const tanggal = new Date(`${tanggalStr}T00:00:00.000Z`);
        return this.prisma.hariLiburNasional.create({
            data: {
                tanggal,
                keterangan,
            },
        });
    }
    async remove(tanggalStr) {
        const tanggal = new Date(`${tanggalStr}T00:00:00.000Z`);
        return this.prisma.hariLiburNasional.delete({
            where: {
                tanggal,
            },
        });
    }
    async sync(year) {
        const hd = new date_holidays_1.default('ID');
        const holidays = hd.getHolidays(year);
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
        const existing = await this.prisma.hariLiburNasional.findFirst({
            where: { tanggal: { gte: startDate, lte: endDate } }
        });
        if (existing) {
            return { success: true, message: `Year ${year} already has data, skipped sync.` };
        }
        let count = 0;
        for (const h of holidays) {
            if (h.type === 'public' && h.date) {
                const dateStr = h.date.split(' ')[0];
                const tanggal = new Date(`${dateStr}T00:00:00.000Z`);
                await this.prisma.hariLiburNasional.upsert({
                    where: { tanggal },
                    update: { keterangan: h.name },
                    create: {
                        tanggal,
                        keterangan: h.name,
                    },
                });
                count++;
            }
        }
        return { success: true, message: `Synced ${count} holidays for year ${year}` };
    }
};
exports.LiburService = LiburService;
exports.LiburService = LiburService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LiburService);
//# sourceMappingURL=libur.service.js.map
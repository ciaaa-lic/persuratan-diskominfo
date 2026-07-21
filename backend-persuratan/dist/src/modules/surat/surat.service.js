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
exports.SuratService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const stok_service_1 = require("../stok/stok.service");
const client_1 = require("@prisma/client");
const log_service_1 = require("../log/log.service");
let SuratService = class SuratService {
    prisma;
    stokService;
    logService;
    constructor(prisma, stokService, logService) {
        this.prisma = prisma;
        this.stokService = stokService;
        this.logService = logService;
    }
    async _logActivity(userId, action, description) {
        const u = userId ? await this.prisma.user.findUnique({ where: { id: userId } }) : null;
        await this.logService.createLog({
            userId,
            userName: u?.name || 'Sistem',
            role: u?.role || 'SYSTEM',
            action,
            description,
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters.bidang) {
            where.bidang = filters.bidang;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.search) {
            where.OR = [
                { perihal: { contains: filters.search } },
                { pengirim: { contains: filters.search } },
                { kodeKlasifikasi: { contains: filters.search } },
                {
                    nomorTerpakai: {
                        nomorSurat: { contains: filters.search },
                    },
                },
            ];
        }
        const list = await this.prisma.pengajuanSurat.findMany({
            where,
            include: {
                nomorTerpakai: true,
                statusHistory: {
                    orderBy: { id: 'asc' },
                },
            },
            orderBy: {
                tanggalPengajuan: 'desc',
            },
        });
        const sorted = list.sort((a, b) => {
            const getPriority = (s) => {
                if (['Selesai', 'Disetujui', 'Ditolak'].includes(s))
                    return 3;
                if (['Diproses', 'Proses', 'Sedang Diproses'].includes(s))
                    return 2;
                return 1;
            };
            const prioA = getPriority(a.status);
            const prioB = getPriority(b.status);
            if (prioA !== prioB)
                return prioA - prioB;
            return new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime();
        });
        return sorted.map((item) => ({
            ...item,
            nomorSurat: item.nomorTerpakai?.nomorSurat || null,
            tanggalSurat: item.tanggalSurat.toISOString().split('T')[0],
            tanggalPengajuan: item.tanggalPengajuan.toISOString(),
        }));
    }
    async getNotifications(userId, role, bidang) {
        const isAdmin = role === 'ADMIN';
        const where = isAdmin ? { user: { role: 'ADMIN' } } : { userId };
        const list = await this.prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 30,
        });
        return list.map(item => ({
            id: item.id.toString(),
            title: item.title,
            message: item.message,
            timestamp: item.createdAt.toISOString(),
            type: item.type,
            read: item.isRead,
            link: item.link,
        }));
    }
    async markNotificationsAsRead(userId, role) {
        const isAdmin = role === 'ADMIN';
        const where = isAdmin ? { user: { role: 'ADMIN' } } : { userId };
        await this.prisma.notification.updateMany({
            where,
            data: { isRead: true },
        });
        return { success: true };
    }
    async findOne(id) {
        const item = await this.prisma.pengajuanSurat.findUnique({
            where: { id },
            include: {
                nomorTerpakai: true,
                statusHistory: {
                    orderBy: { id: 'asc' },
                },
            },
        });
        if (!item)
            throw new common_1.NotFoundException('Surat tidak ditemukan');
        return {
            ...item,
            nomorSurat: item.nomorTerpakai?.nomorSurat || null,
            tanggalSurat: item.tanggalSurat.toISOString().split('T')[0],
            tanggalPengajuan: item.tanggalPengajuan.toISOString(),
        };
    }
    async _generateNomorInternal(tanggalSurat, kodeKlasifikasi) {
        const kode = kodeKlasifikasi || '000';
        const targetDateStr = `${tanggalSurat.getFullYear()}-${String(tanggalSurat.getMonth() + 1).padStart(2, '0')}-${String(tanggalSurat.getDate()).padStart(2, '0')}`;
        const { stokRow } = await this.stokService.ensureAndGetAvailableStock(targetDateStr);
        let nomorStokStr = '';
        let stokId = null;
        if (stokRow) {
            await this.prisma.nomorStok.update({
                where: { id: stokRow.id },
                data: { status: client_1.NomorStokStatus.terpakai },
            });
            nomorStokStr = stokRow.nomorFullStok;
            stokId = stokRow.id;
        }
        else {
            throw new common_1.BadRequestException('Stok nomor hari ini tidak tersedia');
        }
        const monthsRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
        const monthIndex = tanggalSurat.getMonth();
        const monthRomawi = monthsRomawi[monthIndex];
        const year = tanggalSurat.getFullYear();
        const fullNomor = `${kode}/${nomorStokStr}/DISKOMINFO/${monthRomawi}/${year}`;
        return { stokId, fullNomor, kode };
    }
    async create(data, userId) {
        const now = new Date();
        const tanggalSuratObj = new Date(`${data.tanggalSurat}T00:00:00.000Z`);
        const { stokId, fullNomor, kode } = await this._generateNomorInternal(tanggalSuratObj, data.kodeKlasifikasi || '000');
        const created = await this.prisma.pengajuanSurat.create({
            data: {
                userId: userId || null,
                pengirim: data.pengirim,
                perihal: data.perihal,
                bidang: data.bidang,
                tanggalSurat: tanggalSuratObj,
                tanggalPengajuan: now,
                klasifikasi: data.klasifikasi || 'Biasa',
                kodeKlasifikasi: kode,
                lampiran: data.lampiran || null,
                status: 'Selesai',
                statusHistory: {
                    create: [
                        {
                            status: 'Pengajuan dibuat',
                            keterangan: 'Pengajuan surat baru diterima',
                            createdAt: now,
                        },
                        {
                            status: 'Selesai',
                            keterangan: fullNomor,
                            createdAt: new Date(now.getTime() + 1000),
                        }
                    ],
                },
                nomorTerpakai: {
                    create: {
                        nomorStokId: stokId,
                        nomorSurat: fullNomor,
                        kodeKlasifikasi: kode,
                        assignedBy: userId || null,
                        assignedAt: now,
                    }
                }
            },
            include: {
                nomorTerpakai: true,
                statusHistory: true,
            },
        });
        await this._logActivity(userId, 'Buat Surat & Penomoran', `Mengajukan surat baru dan otomatis mendapat nomor: ${fullNomor}`);
        const admins = await this.prisma.user.findMany({ where: { role: 'ADMIN' } });
        const notificationsToCreate = [];
        if (userId) {
            notificationsToCreate.push({
                userId,
                title: 'Nomor Surat Berhasil Diterbitkan',
                message: `Nomor ${fullNomor} otomatis diberikan untuk pengajuan "${data.perihal}"`,
                type: 'nomor',
                link: `/user/arsip?search=${encodeURIComponent(fullNomor)}`,
            });
        }
        for (const admin of admins) {
            notificationsToCreate.push({
                userId: admin.id,
                title: 'Pengajuan Surat Baru & Penomoran Otomatis',
                message: `Bidang ${data.bidang} membuat surat baru dengan nomor ${fullNomor} perihal: "${data.perihal}"`,
                type: 'pengajuan',
                link: `/admin/arsip?search=${encodeURIComponent(fullNomor)}`,
            });
        }
        if (notificationsToCreate.length > 0) {
            await this.prisma.notification.createMany({ data: notificationsToCreate });
        }
        return {
            ...created,
            nomorSurat: fullNomor,
            tanggalSurat: created.tanggalSurat.toISOString().split('T')[0],
            tanggalPengajuan: created.tanggalPengajuan.toISOString(),
        };
    }
    async createBatch(batchList, userId) {
        const results = [];
        const now = new Date();
        for (const data of batchList) {
            const created = await this.create(data, userId);
            results.push(created);
        }
        return results;
    }
    async updateInfo(id, data, userId) {
        const curr = await this.prisma.pengajuanSurat.findUnique({ where: { id } });
        if (!curr)
            throw new common_1.NotFoundException('Surat tidak ditemukan');
        const updateData = {};
        if (data.pengirim !== undefined)
            updateData.pengirim = data.pengirim;
        if (data.perihal !== undefined)
            updateData.perihal = data.perihal;
        if (data.bidang !== undefined)
            updateData.bidang = data.bidang;
        if (data.klasifikasi !== undefined)
            updateData.klasifikasi = data.klasifikasi;
        if (data.tanggalSurat !== undefined)
            updateData.tanggalSurat = new Date(`${data.tanggalSurat}T00:00:00.000Z`);
        if (data.lampiran !== undefined)
            updateData.lampiran = data.lampiran;
        await this.prisma.pengajuanSurat.update({
            where: { id },
            data: updateData,
        });
        await this._logActivity(userId, 'Edit Surat', `Mengubah informasi surat ID ${id}`);
        return this.findOne(id);
    }
    async generateNomor(id, kodeKlasifikasi, assignedByUserId) {
        return this.findOne(id);
    }
    async remove(id, userId) {
        const curr = await this.prisma.pengajuanSurat.findUnique({
            where: { id },
            include: { nomorTerpakai: true }
        });
        if (!curr)
            throw new common_1.NotFoundException('Surat tidak ditemukan');
        const userObj = await this.prisma.user.findUnique({ where: { id: userId } });
        if (userObj?.role !== 'ADMIN' && curr.userId !== userId) {
            throw new common_1.ForbiddenException('Anda hanya dapat menghapus pengajuan surat milik Anda sendiri');
        }
        const nomorSurat = curr.nomorTerpakai?.nomorSurat;
        if (nomorSurat) {
            await this.prisma.notification.deleteMany({
                where: { message: { contains: nomorSurat } }
            });
        }
        else {
            await this.prisma.notification.deleteMany({
                where: { message: { contains: curr.perihal } }
            });
        }
        if (curr.nomorTerpakai?.nomorStokId) {
            await this.prisma.nomorStok.update({
                where: { id: curr.nomorTerpakai.nomorStokId },
                data: { status: 'tersedia' }
            });
        }
        await this.prisma.pengajuanSurat.delete({ where: { id } });
        await this._logActivity(userId, 'Hapus Pengajuan', `Menghapus pengajuan surat ${nomorSurat ? 'nomor ' + nomorSurat : 'perihal: ' + curr.perihal}`);
        return { message: 'Pengajuan surat berhasil dihapus' };
    }
};
exports.SuratService = SuratService;
exports.SuratService = SuratService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stok_service_1.StokService,
        log_service_1.LogService])
], SuratService);
//# sourceMappingURL=surat.service.js.map
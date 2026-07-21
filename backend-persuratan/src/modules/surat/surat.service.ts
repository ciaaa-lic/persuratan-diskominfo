import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { StokService } from '../stok/stok.service';
import { CreateSuratItemDto } from './dto/create-surat.dto';
import { UpdateSuratDto } from './dto/update-surat.dto';
import { NomorStokStatus, Prisma } from '@prisma/client';

import { LogService } from '../log/log.service';

@Injectable()
export class SuratService {
  constructor(
    private prisma: PrismaService,
    private stokService: StokService,
    private logService: LogService,
  ) {}

  private async _logActivity(userId: number | undefined, action: string, description: string) {
    const u = userId ? await this.prisma.user.findUnique({ where: { id: userId } }) : null;
    await this.logService.createLog({
      userId,
      userName: u?.name || 'Sistem',
      role: u?.role || 'SYSTEM',
      action,
      description,
    });
  }

  async findAll(filters: { bidang?: string; status?: string; search?: string }) {
    const where: Prisma.PengajuanSuratWhereInput = {};

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

    // Urutkan kustom sesuai legacy PHP
    const sorted = list.sort((a, b) => {
      const getPriority = (s: string) => {
        if (['Selesai', 'Disetujui', 'Ditolak'].includes(s)) return 3;
        if (['Diproses', 'Proses', 'Sedang Diproses'].includes(s)) return 2;
        return 1;
      };
      const prioA = getPriority(a.status);
      const prioB = getPriority(b.status);
      if (prioA !== prioB) return prioA - prioB;
      return new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime();
    });

    return sorted.map((item) => ({
      ...item,
      nomorSurat: item.nomorTerpakai?.nomorSurat || null,
      tanggalSurat: item.tanggalSurat.toISOString().split('T')[0],
      tanggalPengajuan: item.tanggalPengajuan.toISOString(),
    }));
  }

  async getNotifications(userId?: number, role?: string, bidang?: string) {
    const isAdmin = role === 'ADMIN';
    const where: Prisma.NotificationWhereInput = isAdmin ? { user: { role: 'ADMIN' } } : { userId };

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

  async markNotificationsAsRead(userId?: number, role?: string) {
    const isAdmin = role === 'ADMIN';
    const where: Prisma.NotificationWhereInput = isAdmin ? { user: { role: 'ADMIN' } } : { userId };
    
    await this.prisma.notification.updateMany({
      where,
      data: { isRead: true },
    });
    return { success: true };
  }

  async findOne(id: number) {
    const item = await this.prisma.pengajuanSurat.findUnique({
      where: { id },
      include: {
        nomorTerpakai: true,
        statusHistory: {
          orderBy: { id: 'asc' },
        },
      },
    });
    if (!item) throw new NotFoundException('Surat tidak ditemukan');

    return {
      ...item,
      nomorSurat: item.nomorTerpakai?.nomorSurat || null,
      tanggalSurat: item.tanggalSurat.toISOString().split('T')[0],
      tanggalPengajuan: item.tanggalPengajuan.toISOString(),
    };
  }

  private async _generateNomorInternal(tanggalSurat: Date, kodeKlasifikasi: string) {
    const kode = kodeKlasifikasi || '000';
    const targetDateStr = `${tanggalSurat.getFullYear()}-${String(tanggalSurat.getMonth() + 1).padStart(2, '0')}-${String(tanggalSurat.getDate()).padStart(2, '0')}`;
    const { stokRow } = await this.stokService.ensureAndGetAvailableStock(targetDateStr);

    let nomorStokStr = '';
    let stokId: number | null = null;

    if (stokRow) {
      await this.prisma.nomorStok.update({
        where: { id: stokRow.id },
        data: { status: NomorStokStatus.terpakai },
      });
      nomorStokStr = stokRow.nomorFullStok;
      stokId = stokRow.id;
    } else {
      throw new BadRequestException('Stok nomor hari ini tidak tersedia');
    }

    const monthsRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const monthIndex = tanggalSurat.getMonth();
    const monthRomawi = monthsRomawi[monthIndex];
    const year = tanggalSurat.getFullYear();

    // SOP Format: [kode_klasifikasi]/[nomor]/DISKOMINFO/[bulan_romawi]/[tahun]
    const fullNomor = `${kode}/${nomorStokStr}/DISKOMINFO/${monthRomawi}/${year}`;
    
    return { stokId, fullNomor, kode };
  }

  async create(data: CreateSuratItemDto, userId?: number) {
    const now = new Date();
    const tanggalSuratObj = new Date(`${data.tanggalSurat}T00:00:00.000Z`);
    
    // Auto Generate Nomor
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
        status: 'Selesai', // Langsung selesai karena otomatis dinomori
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
              createdAt: new Date(now.getTime() + 1000), // delay 1 detik agar beda waktu di timeline
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

    // Create Notifications
    const admins = await this.prisma.user.findMany({ where: { role: 'ADMIN' } });
    const notificationsToCreate: Prisma.NotificationCreateManyInput[] = [];
    
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

  async createBatch(batchList: CreateSuratItemDto[], userId?: number) {
    const results: any[] = [];
    const now = new Date();

    for (const data of batchList) {
      const created = await this.create(data, userId);
      results.push(created);
    }

    return results;
  }

  async updateInfo(id: number, data: UpdateSuratDto, userId?: number) {
    const curr = await this.prisma.pengajuanSurat.findUnique({ where: { id } });
    if (!curr) throw new NotFoundException('Surat tidak ditemukan');

    const updateData: Prisma.PengajuanSuratUpdateInput = {};
    if (data.pengirim !== undefined) updateData.pengirim = data.pengirim;
    if (data.perihal !== undefined) updateData.perihal = data.perihal;
    if (data.bidang !== undefined) updateData.bidang = data.bidang;
    if (data.klasifikasi !== undefined) updateData.klasifikasi = data.klasifikasi;
    if (data.tanggalSurat !== undefined)
      updateData.tanggalSurat = new Date(`${data.tanggalSurat}T00:00:00.000Z`);
    if (data.lampiran !== undefined) updateData.lampiran = data.lampiran;

    await this.prisma.pengajuanSurat.update({
      where: { id },
      data: updateData,
    });

    await this._logActivity(userId, 'Edit Surat', `Mengubah informasi surat ID ${id}`);

    return this.findOne(id);
  }

  async generateNomor(id: number, kodeKlasifikasi: string, assignedByUserId?: number) {
    // Legacy function, no longer used in standard flow but kept for compatibility
    return this.findOne(id);
  }

  async remove(id: number, userId?: number) {
    const curr = await this.prisma.pengajuanSurat.findUnique({ 
      where: { id },
      include: { nomorTerpakai: true }
    });
    
    if (!curr) throw new NotFoundException('Surat tidak ditemukan');
    
    // Authorization check: User can only delete their own letter
    const userObj = await this.prisma.user.findUnique({ where: { id: userId } });
    if (userObj?.role !== 'ADMIN' && curr.userId !== userId) {
      throw new ForbiddenException('Anda hanya dapat menghapus pengajuan surat milik Anda sendiri');
    }
    
    const nomorSurat = curr.nomorTerpakai?.nomorSurat;

    // Hapus Notifikasi terkait surat ini (menggunakan filter string perihal / nomor)
    if (nomorSurat) {
       await this.prisma.notification.deleteMany({
          where: { message: { contains: nomorSurat } }
       });
    } else {
       await this.prisma.notification.deleteMany({
          where: { message: { contains: curr.perihal } }
       });
    }

    // Kembalikan stok nomor ke 'tersedia'
    if (curr.nomorTerpakai?.nomorStokId) {
       await this.prisma.nomorStok.update({
         where: { id: curr.nomorTerpakai.nomorStokId },
         data: { status: 'tersedia' }
       });
    }

    // Delete surat (akan cascade ke nomor_terpakai dan status_history)
    await this.prisma.pengajuanSurat.delete({ where: { id } });
    
    await this._logActivity(userId, 'Hapus Pengajuan', `Menghapus pengajuan surat ${nomorSurat ? 'nomor ' + nomorSurat : 'perihal: ' + curr.perihal}`);
    
    return { message: 'Pengajuan surat berhasil dihapus' };
  }
}

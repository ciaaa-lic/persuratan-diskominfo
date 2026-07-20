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

    // Urutkan kustom sesuai legacy PHP (Menunggu/Diproses dahulu, Selesai belakangan)
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

    // Query pengajuan surat terbaru sesuai role dan user_id/bidang
    const where: Prisma.PengajuanSuratWhereInput = isAdmin
      ? {} // Admin bisa lihat semua pengajuan dari bidang mana pun
      : {
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(bidang ? [{ bidang }] : []),
          ],
        };

    const list = await this.prisma.pengajuanSurat.findMany({
      where,
      include: {
        nomorTerpakai: true,
      },
      orderBy: {
        tanggalPengajuan: 'desc',
      },
      take: 30,
    });

    const notifications: Array<{
      id: string;
      title: string;
      message: string;
      timestamp: string;
      type: 'pengajuan' | 'nomor';
      read: boolean;
      link: string;
    }> = [];

    for (const item of list) {
      if (isAdmin) {
        // Admin: notif ada pengajuan surat baru dari bidang
        if (['Menunggu', 'Belum Selesai', 'Belum Diproses', 'Diproses'].includes(item.status)) {
          notifications.push({
            id: `admin-sub-${item.id}`,
            title: 'Pengajuan Surat Baru',
            message: `Bidang ${item.bidang} mengajukan penomoran perihal: "${item.perihal}"`,
            timestamp: item.tanggalPengajuan.toISOString(),
            type: 'pengajuan',
            read: false,
            link: `/admin/surat?search=${encodeURIComponent(item.perihal)}`,
          });
        }
        // Admin: notif proses pemberian nomor berhasil disimpan
        if (item.nomorTerpakai) {
          notifications.push({
            id: `admin-num-${item.id}`,
            title: 'Nomor Surat Berhasil Diterbitkan',
            message: `Nomor ${item.nomorTerpakai.nomorSurat} diberikan untuk pengajuan "${item.perihal}" (${item.bidang})`,
            timestamp: item.nomorTerpakai.assignedAt.toISOString(),
            type: 'nomor',
            read: false,
            link: `/admin/arsip?search=${encodeURIComponent(item.nomorTerpakai.nomorSurat)}`,
          });
        }
      } else {
        // Bidang: notif berhasil mengajukan surat
        notifications.push({
          id: `user-sub-${item.id}`,
          title: 'Pengajuan Surat Berhasil Disimpan',
          message: `Surat "${item.perihal}" berhasil diajukan dan sedang menunggu verifikasi Admin.`,
          timestamp: item.tanggalPengajuan.toISOString(),
          type: 'pengajuan',
          read: false,
          link: `/user/arsip?search=${encodeURIComponent(item.perihal)}`,
        });
        // Bidang: notif surat telah diberikan nomor oleh admin
        if (item.nomorTerpakai) {
          notifications.push({
            id: `user-num-${item.id}`,
            title: 'Nomor Surat Telah Diberikan',
            message: `Surat "${item.perihal}" telah diberikan nomor resmi: ${item.nomorTerpakai.nomorSurat}`,
            timestamp: item.nomorTerpakai.assignedAt.toISOString(),
            type: 'nomor',
            read: false,
            link: `/user/arsip?search=${encodeURIComponent(item.nomorTerpakai.nomorSurat)}`,
          });
        }
      }
    }

    notifications.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return notifications.slice(0, 20);
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

  async create(data: CreateSuratItemDto, userId?: number) {
    const now = new Date();
    const created = await this.prisma.pengajuanSurat.create({
      data: {
        userId: userId || null,
        pengirim: data.pengirim,
        perihal: data.perihal,
        bidang: data.bidang,
        tanggalSurat: new Date(`${data.tanggalSurat}T00:00:00.000Z`),
        tanggalPengajuan: now,
        klasifikasi: data.klasifikasi || 'Biasa',
        kodeKlasifikasi: data.kodeKlasifikasi || null,
        lampiran: data.lampiran || null,
        status: 'Menunggu',
        statusHistory: {
          create: {
            status: 'Pengajuan dibuat',
            keterangan: 'Pengajuan surat baru diterima',
            createdAt: now,
          },
        },
      },
      include: {
        nomorTerpakai: true,
        statusHistory: true,
      },
    });

    await this._logActivity(userId, 'Buat Surat', `Mengajukan surat baru dengan perihal: ${data.perihal}`);

    return {
      ...created,
      nomorSurat: null,
      tanggalSurat: created.tanggalSurat.toISOString().split('T')[0],
      tanggalPengajuan: created.tanggalPengajuan.toISOString(),
    };
  }

  async createBatch(batchList: CreateSuratItemDto[], userId?: number) {
    const results: Array<Record<string, unknown>> = [];
    const now = new Date();

    for (const item of batchList) {
      const created = await this.prisma.pengajuanSurat.create({
        data: {
          userId: userId || null,
          pengirim: item.pengirim,
          perihal: item.perihal,
          bidang: item.bidang,
          tanggalSurat: new Date(`${item.tanggalSurat}T00:00:00.000Z`),
          tanggalPengajuan: now,
          klasifikasi: item.klasifikasi || 'Biasa',
          kodeKlasifikasi: item.kodeKlasifikasi || null,
          lampiran: item.lampiran || null,
          status: 'Menunggu',
          statusHistory: {
            create: {
              status: 'Pengajuan dibuat',
              keterangan: 'Pengajuan surat baru diterima (Batch)',
              createdAt: now,
            },
          },
        },
        include: {
          nomorTerpakai: true,
          statusHistory: true,
        },
      });

      results.push({
        ...created,
        nomorSurat: null,
        tanggalSurat: created.tanggalSurat.toISOString().split('T')[0],
        tanggalPengajuan: created.tanggalPengajuan.toISOString(),
      });
    }

    await this._logActivity(userId, 'Buat Surat Batch', `Mengajukan ${batchList.length} surat baru secara kolektif`);

    return results;
  }

  async updateInfo(id: number, data: UpdateSuratDto, userId?: number) {
    const curr = await this.prisma.pengajuanSurat.findUnique({ where: { id } });
    if (!curr) throw new NotFoundException('Surat tidak ditemukan');

    if (!['Menunggu', 'Belum Selesai', 'Belum Diproses'].includes(curr.status)) {
      throw new ForbiddenException('Surat yang sudah diproses atau selesai tidak dapat diedit');
    }

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
    const curr = await this.prisma.pengajuanSurat.findUnique({ where: { id } });
    if (!curr) throw new NotFoundException('Surat tidak ditemukan');

    const kode = kodeKlasifikasi || '000';
    const now = new Date();
    
    // Logika Nomor Surat Berdasarkan Tanggal Surat
    const tglSurat = curr.tanggalSurat;
    const targetDateStr = `${tglSurat.getFullYear()}-${String(tglSurat.getMonth() + 1).padStart(2, '0')}-${String(tglSurat.getDate()).padStart(2, '0')}`;
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
    const monthIndex = tglSurat.getMonth();
    const monthRomawi = monthsRomawi[monthIndex];
    const year = tglSurat.getFullYear();

    // SOP Format: [kode_klasifikasi]/[nomor]/DISKOMINFO/[bulan_romawi]/[tahun]
    const fullNomor = `${kode}/${nomorStokStr}/DISKOMINFO/${monthRomawi}/${year}`;

    await this.prisma.$transaction([
      this.prisma.pengajuanSurat.update({
        where: { id },
        data: {
          status: 'Selesai',
          kodeKlasifikasi: kode,
        },
      }),
      this.prisma.nomorTerpakai.create({
        data: {
          pengajuanId: id,
          nomorStokId: stokId,
          nomorSurat: fullNomor,
          kodeKlasifikasi: kode,
          assignedBy: assignedByUserId || null,
          assignedAt: now,
        },
      }),
      this.prisma.statusHistory.create({
        data: {
          pengajuanId: id,
          status: 'Nomor surat diterbitkan',
          keterangan: fullNomor,
          createdAt: now,
        },
      }),
    ]);

    await this._logActivity(assignedByUserId, 'Beri Nomor', `Memberikan nomor surat ${fullNomor} pada pengajuan ID ${id}`);

    return this.findOne(id);
  }

  async remove(id: number, userId?: number) {
    const curr = await this.prisma.pengajuanSurat.findUnique({ where: { id } });
    if (!curr) throw new NotFoundException('Surat tidak ditemukan');

    if (!['Menunggu', 'Belum Selesai', 'Belum Diproses'].includes(curr.status)) {
      throw new ForbiddenException('Surat yang sudah diproses atau selesai tidak dapat dibatalkan');
    }

    await this.prisma.pengajuanSurat.delete({ where: { id } });
    await this._logActivity(userId, 'Hapus Surat', `Menghapus pengajuan surat ID ${id}`);
    return { message: 'Pengajuan surat berhasil dibatalkan' };
  }
}

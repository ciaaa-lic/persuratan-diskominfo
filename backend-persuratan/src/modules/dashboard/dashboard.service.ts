import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { StokService } from '../stok/stok.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private stokService: StokService,
  ) {}

  async getStats() {
    const todayStr = new Date().toISOString().split('T')[0];
    const stokSummary = await this.stokService.getStokSummary(todayStr);

    const now = new Date();
    const todayStart = new Date(`${todayStr}T00:00:00.000Z`);
    const todayEnd = new Date(`${todayStr}T23:59:59.999Z`);

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      pengajuanHariIni,
      menungguHariIni,
      selesaiHariIni,
      masukBulanIni,
      keluarBulanIni,
      dibatalkanBulanIni,
      dibatalkanHariIni
    ] = await Promise.all([
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
      this.prisma.pengajuanSurat.count({
        where: { status: 'Dibatalkan', tanggalPengajuan: { gte: firstDayOfMonth, lte: lastDayOfMonth } },
      }),
      this.prisma.pengajuanSurat.count({
        where: { status: 'Dibatalkan', tanggalPengajuan: { gte: todayStart, lte: todayEnd } },
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
        dibatalkan: dibatalkanHariIni,
      },
      bulanIni: {
        masuk: masukBulanIni,
        keluar: keluarBulanIni,
        terpakai: keluarBulanIni, // Total Nomor Surat Terpakai is identical to Surat Keluar
        dibatalkan: dibatalkanBulanIni,
      },
    };
  }
}

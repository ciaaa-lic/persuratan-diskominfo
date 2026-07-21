import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NomorStokStatus } from '@prisma/client';

@Injectable()
export class StokService {
  constructor(private prisma: PrismaService) {}

  /**
   * Menghitung jumlah hari kerja sejak 1 Januari tahun targetDate s.d. targetDate.
   * Mengabaikan Sabtu (6), Minggu (0 di JS / 7 di ISO), dan tanggal di tabel hari_libur_nasional.
   * Perhitungan menggunakan murni operasi kalender lokal (tanpa pergeseran zona waktu UTC).
   */
  async getWorkingDaysCount(targetDateStr: string): Promise<number> {
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
      const dayOfWeek = d.getDay(); // 0 = Minggu, 6 = Sabtu
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

  /**
   * Mengembalikan rentang nomor dasar untuk hari kerja ke-W:
   * start: ((W - 1) * 40) + 1
   * end: W * 40
   */
  getDailyNumberRange(workingDayIndex: number): { start: number; end: number } {
    const start = (workingDayIndex - 1) * 40 + 1;
    const end = workingDayIndex * 40;
    return { start, end };
  }

  /**
   * Memastikan stok blok awal (tanpa suffix) untuk tanggal & rentang hari kerja tersebut tersedia.
   * Mengembalikan stokRow pertama yang 'tersedia'. Jika habis, otomatis membuat blok suffix berikutnya (A..Z).
   */
  async ensureAndGetAvailableStock(targetDateStr: string) {
    const targetDate = new Date(`${targetDateStr}T00:00:00.000Z`);
    const workingDayIndex = await this.getWorkingDaysCount(targetDateStr);
    const { start: startNum, end: endNum } = this.getDailyNumberRange(workingDayIndex);

    // Cek apakah stok dasar (suffix '') pada rentang hari tersebut sudah ada di nomor_stok
    const countCheck = await this.prisma.nomorStok.count({
      where: {
        tanggal: targetDate,
        urutan: { gte: startNum, lte: endNum },
      },
    });

    if (countCheck === 0) {
      const createData: any[] = [];
      for (let u = startNum; u <= endNum; u++) {
        createData.push({
          tanggal: targetDate,
          urutan: u,
          suffix: '',
          nomorFullStok: `${u}`,
          status: NomorStokStatus.tersedia,
        });
      }
      await this.prisma.nomorStok.createMany({
        data: createData,
        skipDuplicates: true,
      });
    }

    // Cari stok pertama yang tersedia pada rentang hari ini (paling kecil/awal)
    let stokRow = await this.prisma.nomorStok.findFirst({
      where: {
        tanggal: targetDate,
        urutan: { gte: startNum, lte: endNum },
        status: NomorStokStatus.tersedia,
      },
      orderBy: [
        { urutan: 'asc' },
        { suffix: 'asc' }
      ],
    });

    if (!stokRow) {
      // Jika semua stok di rentang ini terpakai, cari suffix terakhir yang pernah dibuat di rentang ini
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
        } else {
          nextSuff = 'Z';
        }
      }

      const createSuffixData: any[] = [];
      for (let u = startNum; u <= endNum; u++) {
        createSuffixData.push({
          tanggal: targetDate,
          urutan: u,
          suffix: nextSuff,
          nomorFullStok: `${u}.${nextSuff}`,
          status: NomorStokStatus.tersedia,
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
          status: NomorStokStatus.tersedia,
        },
        orderBy: [
          { urutan: 'asc' },
          { suffix: 'asc' }
        ],
      });
    }

    return {
      stokRow,
      workingDayIndex,
      startNum,
      endNum,
    };
  }

  /**
   * Mengembalikan ringkasan stok nomor harian untuk Dasbor Admin
   */
  async getStokSummary(targetDateStr: string) {
    const targetDate = new Date(`${targetDateStr}T00:00:00.000Z`);
    const workingDayIndex = await this.getWorkingDaysCount(targetDateStr);
    const { start: startNum, end: endNum } = this.getDailyNumberRange(workingDayIndex);

    // Pastikan stok dasar tersedia
    await this.ensureAndGetAvailableStock(targetDateStr);

    const stokList = await this.prisma.nomorStok.findMany({
      where: {
        tanggal: targetDate,
        urutan: { gte: startNum, lte: endNum },
      },
    });

    const suffixMap: Record<string, { total: number; used: number }> = {};
    for (const row of stokList) {
      const suff = row.suffix;
      if (!suffixMap[suff]) {
        suffixMap[suff] = { total: 0, used: 0 };
      }
      suffixMap[suff].total++;
      if (row.status === NomorStokStatus.terpakai) {
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

    // Hitung total terpakai dari nomorTerpakai pada tanggal tersebut
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
}

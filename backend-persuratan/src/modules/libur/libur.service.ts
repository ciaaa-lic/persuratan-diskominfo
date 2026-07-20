import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import Holidays from 'date-holidays';

@Injectable()
export class LiburService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const currentYear = new Date().getFullYear();
    // Auto-sync holidays for -3 to +5 years from current year
    console.log('[LiburService] Auto-syncing public holidays...');
    for (let y = currentYear - 3; y <= currentYear + 5; y++) {
      await this.sync(y);
    }
    console.log('[LiburService] Public holidays synced.');
  }

  async findAll(year?: number) {
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

  async create(tanggalStr: string, keterangan: string) {
    const tanggal = new Date(`${tanggalStr}T00:00:00.000Z`);
    return this.prisma.hariLiburNasional.create({
      data: {
        tanggal,
        keterangan,
      },
    });
  }

  async remove(tanggalStr: string) {
    const tanggal = new Date(`${tanggalStr}T00:00:00.000Z`);
    return this.prisma.hariLiburNasional.delete({
      where: {
        tanggal,
      },
    });
  }

  async sync(year: number) {
    const hd = new Holidays('ID');
    const holidays = hd.getHolidays(year);

    // Check if we already have synced this year to save DB calls on restart
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
}

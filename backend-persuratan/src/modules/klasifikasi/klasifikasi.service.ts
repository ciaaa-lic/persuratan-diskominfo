import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

import { KLASIFIKASI_RESMI_234 } from './klasifikasi.data';

@Injectable()
export class KlasifikasiService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureSeeded();
  }

  async ensureSeeded() {
    try {
      const count = await this.prisma.klasifikasi.count();
      if (count < KLASIFIKASI_RESMI_234.length) {
        const uniqueCodes = new Set<string>();
        const dataToInsert: { kode: string; uraian: string }[] = [];
        for (const item of KLASIFIKASI_RESMI_234) {
          if (!uniqueCodes.has(item.kode)) {
            uniqueCodes.add(item.kode);
            dataToInsert.push({ kode: item.kode, uraian: item.uraian });
          }
        }

        try {
          await this.prisma.klasifikasi.createMany({
            data: dataToInsert,
            skipDuplicates: true,
          });
        } catch (err) {
          for (const item of dataToInsert) {
            await this.prisma.klasifikasi.upsert({
              where: { kode: item.kode },
              update: { uraian: item.uraian },
              create: item,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error seeding klasifikasi:', error);
    }
  }

  async findAll(search?: string) {
    await this.ensureSeeded();

    if (search) {
      return this.prisma.klasifikasi.findMany({
        where: {
          OR: [{ kode: { contains: search } }, { uraian: { contains: search } }],
        },
        orderBy: { kode: 'asc' },
      });
    }
    return this.prisma.klasifikasi.findMany({
      orderBy: { kode: 'asc' },
    });
  }

  async findByKode(kode: string) {
    await this.ensureSeeded();
    return this.prisma.klasifikasi.findUnique({
      where: { kode },
    });
  }
}

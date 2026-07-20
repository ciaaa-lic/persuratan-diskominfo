import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
export declare class KlasifikasiService implements OnModuleInit {
    private prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    ensureSeeded(): Promise<void>;
    findAll(search?: string): Promise<{
        id: number;
        kode: string;
        uraian: string;
    }[]>;
    findByKode(kode: string): Promise<{
        id: number;
        kode: string;
        uraian: string;
    } | null>;
}

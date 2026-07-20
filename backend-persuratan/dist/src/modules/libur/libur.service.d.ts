import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
export declare class LiburService implements OnModuleInit {
    private prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    findAll(year?: number): Promise<{
        id: number;
        tanggal: Date;
        keterangan: string;
        createdAt: Date;
    }[]>;
    create(tanggalStr: string, keterangan: string): Promise<{
        id: number;
        tanggal: Date;
        keterangan: string;
        createdAt: Date;
    }>;
    remove(tanggalStr: string): Promise<{
        id: number;
        tanggal: Date;
        keterangan: string;
        createdAt: Date;
    }>;
    sync(year: number): Promise<{
        success: boolean;
        message: string;
    }>;
}

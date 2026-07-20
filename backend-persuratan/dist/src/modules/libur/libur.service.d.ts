import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
export declare class LiburService implements OnModuleInit {
    private prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    findAll(year?: number): Promise<{
        id: number;
        createdAt: Date;
        tanggal: Date;
        keterangan: string;
    }[]>;
    create(tanggalStr: string, keterangan: string): Promise<{
        id: number;
        createdAt: Date;
        tanggal: Date;
        keterangan: string;
    }>;
    remove(tanggalStr: string): Promise<{
        id: number;
        createdAt: Date;
        tanggal: Date;
        keterangan: string;
    }>;
    sync(year: number): Promise<{
        success: boolean;
        message: string;
    }>;
}

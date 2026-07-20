import { PrismaService } from '../../core/prisma/prisma.service';
export declare class StokService {
    private prisma;
    constructor(prisma: PrismaService);
    getWorkingDaysCount(targetDateStr: string): Promise<number>;
    getDailyNumberRange(workingDayIndex: number): {
        start: number;
        end: number;
    };
    ensureAndGetAvailableStock(targetDateStr: string): Promise<{
        stokRow: {
            id: number;
            createdAt: Date;
            tanggal: Date;
            status: import(".prisma/client").$Enums.NomorStokStatus;
            urutan: number;
            suffix: string;
            nomorFullStok: string;
        } | null;
        workingDayIndex: number;
        startNum: number;
        endNum: number;
    }>;
    getStokSummary(targetDateStr: string): Promise<{
        tanggal: string;
        workingDayIndex: number;
        numberRange: string;
        totalTerpakai: number;
        groups: {
            suffix: string;
            total: number;
            used: number;
        }[];
    }>;
}

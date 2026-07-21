import { PrismaService } from '../../core/prisma/prisma.service';
import { StokService } from '../stok/stok.service';
export declare class DashboardService {
    private prisma;
    private stokService;
    constructor(prisma: PrismaService, stokService: StokService);
    getStats(): Promise<{
        workingDayIndex: number;
        numberRange: string;
        stokSummary: {
            tanggal: string;
            workingDayIndex: number;
            numberRange: string;
            totalTerpakai: number;
            groups: {
                suffix: string;
                total: number;
                used: number;
            }[];
        };
        hariIni: {
            pengajuan: number;
            menunggu: number;
            selesai: number;
            dibatalkan: number;
        };
        bulanIni: {
            masuk: number;
            keluar: number;
            terpakai: number;
            dibatalkan: number;
        };
    }>;
}

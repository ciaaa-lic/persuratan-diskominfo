import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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

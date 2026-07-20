import { AdminService } from './admin.service';
import { DashboardService } from '../dashboard/dashboard.service';
export declare class AdminController {
    private readonly adminService;
    private readonly dashboardService;
    constructor(adminService: AdminService, dashboardService: DashboardService);
    getDashboardData(): Promise<{
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
        };
        bulanIni: {
            masuk: number;
            keluar: number;
            terpakai: number;
        };
    }>;
}

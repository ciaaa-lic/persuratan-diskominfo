import { StokService } from './stok.service';
export declare class StokController {
    private readonly stokService;
    constructor(stokService: StokService);
    getSummary(tanggal?: string): Promise<{
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

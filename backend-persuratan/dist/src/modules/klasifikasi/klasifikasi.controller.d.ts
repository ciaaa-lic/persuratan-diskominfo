import { KlasifikasiService } from './klasifikasi.service';
export declare class KlasifikasiController {
    private readonly klasifikasiService;
    constructor(klasifikasiService: KlasifikasiService);
    findAll(search?: string): Promise<{
        id: number;
        kode: string;
        uraian: string;
    }[]>;
}

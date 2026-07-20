import { LiburService } from './libur.service';
export declare class LiburController {
    private readonly liburService;
    constructor(liburService: LiburService);
    findAll(year?: string): Promise<{
        id: number;
        tanggal: Date;
        keterangan: string;
        createdAt: Date;
    }[]>;
    create(body: {
        tanggal: string;
        keterangan: string;
    }): Promise<{
        id: number;
        tanggal: Date;
        keterangan: string;
        createdAt: Date;
    }>;
    remove(tanggal: string): Promise<{
        id: number;
        tanggal: Date;
        keterangan: string;
        createdAt: Date;
    }>;
    sync(year: string): Promise<{
        success: boolean;
        message: string;
    }>;
}

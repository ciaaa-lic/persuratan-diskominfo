import { LiburService } from './libur.service';
export declare class LiburController {
    private readonly liburService;
    constructor(liburService: LiburService);
    findAll(year?: string): Promise<{
        id: number;
        createdAt: Date;
        tanggal: Date;
        keterangan: string;
    }[]>;
    create(body: {
        tanggal: string;
        keterangan: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        tanggal: Date;
        keterangan: string;
    }>;
    remove(tanggal: string): Promise<{
        id: number;
        createdAt: Date;
        tanggal: Date;
        keterangan: string;
    }>;
    sync(year: string): Promise<{
        success: boolean;
        message: string;
    }>;
}

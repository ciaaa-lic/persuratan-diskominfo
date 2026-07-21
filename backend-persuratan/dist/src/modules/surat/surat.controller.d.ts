import { SuratService } from './surat.service';
import { CreateSuratItemDto, CreateSuratBatchDto } from './dto/create-surat.dto';
import { UpdateSuratDto, GenerateNomorDto } from './dto/update-surat.dto';
interface AuthenticatedRequest {
    user: {
        userId: number;
        email: string;
        role: string;
        bidang?: string;
    };
}
export declare class SuratController {
    private readonly suratService;
    constructor(suratService: SuratService);
    findAll(bidang?: string, status?: string, search?: string): Promise<{
        nomorSurat: string | null;
        tanggalSurat: string;
        tanggalPengajuan: string;
        nomorTerpakai: {
            id: number;
            kodeKlasifikasi: string;
            pengajuanId: number;
            nomorStokId: number | null;
            nomorSurat: string;
            assignedBy: number | null;
            assignedAt: Date;
        } | null;
        statusHistory: {
            id: number;
            createdAt: Date;
            keterangan: string | null;
            status: string;
            pengajuanId: number;
        }[];
        id: number;
        bidang: string;
        createdAt: Date;
        klasifikasi: string | null;
        pengirim: string;
        kodeKlasifikasi: string | null;
        perihal: string;
        lampiran: string | null;
        status: string;
        klasifikasiId: number | null;
        userId: number | null;
    }[]>;
    getNotifications(req: AuthenticatedRequest): Promise<{
        id: string;
        title: string;
        message: string;
        timestamp: string;
        type: string;
        read: boolean;
        link: string;
    }[]>;
    markNotificationsAsRead(req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
    findOne(id: number): Promise<{
        nomorSurat: string | null;
        tanggalSurat: string;
        tanggalPengajuan: string;
        nomorTerpakai: {
            id: number;
            kodeKlasifikasi: string;
            pengajuanId: number;
            nomorStokId: number | null;
            nomorSurat: string;
            assignedBy: number | null;
            assignedAt: Date;
        } | null;
        statusHistory: {
            id: number;
            createdAt: Date;
            keterangan: string | null;
            status: string;
            pengajuanId: number;
        }[];
        id: number;
        bidang: string;
        createdAt: Date;
        klasifikasi: string | null;
        pengirim: string;
        kodeKlasifikasi: string | null;
        perihal: string;
        lampiran: string | null;
        status: string;
        klasifikasiId: number | null;
        userId: number | null;
    }>;
    create(body: CreateSuratItemDto, req: AuthenticatedRequest): Promise<{
        nomorSurat: string;
        tanggalSurat: string;
        tanggalPengajuan: string;
        nomorTerpakai: {
            id: number;
            kodeKlasifikasi: string;
            pengajuanId: number;
            nomorStokId: number | null;
            nomorSurat: string;
            assignedBy: number | null;
            assignedAt: Date;
        } | null;
        statusHistory: {
            id: number;
            createdAt: Date;
            keterangan: string | null;
            status: string;
            pengajuanId: number;
        }[];
        id: number;
        bidang: string;
        createdAt: Date;
        klasifikasi: string | null;
        pengirim: string;
        kodeKlasifikasi: string | null;
        perihal: string;
        lampiran: string | null;
        status: string;
        klasifikasiId: number | null;
        userId: number | null;
    }>;
    createBatch(body: CreateSuratBatchDto, req: AuthenticatedRequest): Promise<any[]>;
    updateInfo(id: number, body: UpdateSuratDto, req: AuthenticatedRequest): Promise<{
        nomorSurat: string | null;
        tanggalSurat: string;
        tanggalPengajuan: string;
        nomorTerpakai: {
            id: number;
            kodeKlasifikasi: string;
            pengajuanId: number;
            nomorStokId: number | null;
            nomorSurat: string;
            assignedBy: number | null;
            assignedAt: Date;
        } | null;
        statusHistory: {
            id: number;
            createdAt: Date;
            keterangan: string | null;
            status: string;
            pengajuanId: number;
        }[];
        id: number;
        bidang: string;
        createdAt: Date;
        klasifikasi: string | null;
        pengirim: string;
        kodeKlasifikasi: string | null;
        perihal: string;
        lampiran: string | null;
        status: string;
        klasifikasiId: number | null;
        userId: number | null;
    }>;
    generateNomor(id: number, body: GenerateNomorDto, req: AuthenticatedRequest): Promise<{
        nomorSurat: string | null;
        tanggalSurat: string;
        tanggalPengajuan: string;
        nomorTerpakai: {
            id: number;
            kodeKlasifikasi: string;
            pengajuanId: number;
            nomorStokId: number | null;
            nomorSurat: string;
            assignedBy: number | null;
            assignedAt: Date;
        } | null;
        statusHistory: {
            id: number;
            createdAt: Date;
            keterangan: string | null;
            status: string;
            pengajuanId: number;
        }[];
        id: number;
        bidang: string;
        createdAt: Date;
        klasifikasi: string | null;
        pengirim: string;
        kodeKlasifikasi: string | null;
        perihal: string;
        lampiran: string | null;
        status: string;
        klasifikasiId: number | null;
        userId: number | null;
    }>;
    remove(id: number, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    uploadFile(file: Express.Multer.File): {
        url: null;
        filename: null;
    } | {
        url: string;
        filename: string;
    };
}
export {};

import { PrismaService } from '../../core/prisma/prisma.service';
import { StokService } from '../stok/stok.service';
import { CreateSuratItemDto } from './dto/create-surat.dto';
import { UpdateSuratDto } from './dto/update-surat.dto';
import { LogService } from '../log/log.service';
export declare class SuratService {
    private prisma;
    private stokService;
    private logService;
    constructor(prisma: PrismaService, stokService: StokService, logService: LogService);
    private _logActivity;
    findAll(filters: {
        bidang?: string;
        status?: string;
        search?: string;
    }): Promise<{
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
    getNotifications(userId?: number, role?: string, bidang?: string): Promise<{
        id: string;
        title: string;
        message: string;
        timestamp: string;
        type: "pengajuan" | "nomor";
        read: boolean;
        link: string;
    }[]>;
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
    create(data: CreateSuratItemDto, userId?: number): Promise<{
        nomorSurat: null;
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
    createBatch(batchList: CreateSuratItemDto[], userId?: number): Promise<Record<string, unknown>[]>;
    updateInfo(id: number, data: UpdateSuratDto, userId?: number): Promise<{
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
    generateNomor(id: number, kodeKlasifikasi: string, assignedByUserId?: number): Promise<{
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
    remove(id: number, userId?: number): Promise<{
        message: string;
    }>;
}

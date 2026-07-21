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
            status: string;
            createdAt: Date;
            pengajuanId: number;
            keterangan: string | null;
        }[];
        id: number;
        userId: number | null;
        pengirim: string;
        klasifikasiId: number | null;
        kodeKlasifikasi: string | null;
        klasifikasi: string | null;
        perihal: string;
        bidang: string;
        lampiran: string | null;
        status: string;
        createdAt: Date;
    }[]>;
    getNotifications(userId?: number, role?: string, bidang?: string): Promise<{
        id: string;
        title: string;
        message: string;
        timestamp: string;
        type: string;
        read: boolean;
        link: string;
    }[]>;
    markNotificationsAsRead(userId?: number, role?: string): Promise<{
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
            status: string;
            createdAt: Date;
            pengajuanId: number;
            keterangan: string | null;
        }[];
        id: number;
        userId: number | null;
        pengirim: string;
        klasifikasiId: number | null;
        kodeKlasifikasi: string | null;
        klasifikasi: string | null;
        perihal: string;
        bidang: string;
        lampiran: string | null;
        status: string;
        createdAt: Date;
    }>;
    private _generateNomorInternal;
    create(data: CreateSuratItemDto, userId?: number): Promise<{
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
            status: string;
            createdAt: Date;
            pengajuanId: number;
            keterangan: string | null;
        }[];
        id: number;
        userId: number | null;
        pengirim: string;
        klasifikasiId: number | null;
        kodeKlasifikasi: string | null;
        klasifikasi: string | null;
        perihal: string;
        bidang: string;
        lampiran: string | null;
        status: string;
        createdAt: Date;
    }>;
    createBatch(batchList: CreateSuratItemDto[], userId?: number): Promise<any[]>;
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
            status: string;
            createdAt: Date;
            pengajuanId: number;
            keterangan: string | null;
        }[];
        id: number;
        userId: number | null;
        pengirim: string;
        klasifikasiId: number | null;
        kodeKlasifikasi: string | null;
        klasifikasi: string | null;
        perihal: string;
        bidang: string;
        lampiran: string | null;
        status: string;
        createdAt: Date;
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
            status: string;
            createdAt: Date;
            pengajuanId: number;
            keterangan: string | null;
        }[];
        id: number;
        userId: number | null;
        pengirim: string;
        klasifikasiId: number | null;
        kodeKlasifikasi: string | null;
        klasifikasi: string | null;
        perihal: string;
        bidang: string;
        lampiran: string | null;
        status: string;
        createdAt: Date;
    }>;
    remove(id: number, userId?: number): Promise<{
        message: string;
    }>;
}

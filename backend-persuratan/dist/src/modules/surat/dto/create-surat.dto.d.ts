export declare class CreateSuratItemDto {
    pengirim: string;
    perihal: string;
    bidang: string;
    tanggalSurat: string;
    klasifikasi?: string;
    kodeKlasifikasi?: string;
    lampiran?: string;
}
export declare class CreateSuratBatchDto {
    batchList: CreateSuratItemDto[];
}

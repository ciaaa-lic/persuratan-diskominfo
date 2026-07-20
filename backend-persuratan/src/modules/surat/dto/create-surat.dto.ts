import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSuratItemDto {
  @ApiProperty({ example: 'Kepala Bidang APTIKA' })
  @IsString()
  @IsNotEmpty()
  pengirim: string;

  @ApiProperty({ example: 'Undangan Rapat Koordinasi TIK' })
  @IsString()
  @IsNotEmpty()
  perihal: string;

  @ApiProperty({ example: 'APTIKA' })
  @IsString()
  @IsNotEmpty()
  bidang: string;

  @ApiProperty({ example: '2026-07-17' })
  @IsString()
  @IsNotEmpty()
  tanggalSurat: string;

  @ApiPropertyOptional({ example: 'Biasa' })
  @IsString()
  @IsOptional()
  klasifikasi?: string;

  @ApiPropertyOptional({ example: '486' })
  @IsString()
  @IsOptional()
  kodeKlasifikasi?: string;

  @ApiPropertyOptional({ example: '/uploads/surat-123.pdf' })
  @IsString()
  @IsOptional()
  lampiran?: string;
}

export class CreateSuratBatchDto {
  @ApiProperty({ type: [CreateSuratItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSuratItemDto)
  batchList: CreateSuratItemDto[];
}

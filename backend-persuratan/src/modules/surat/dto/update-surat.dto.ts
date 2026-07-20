import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSuratDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pengirim?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  perihal?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tanggalSurat?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  klasifikasi?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bidang?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lampiran?: string;
}

export class GenerateNomorDto {
  @ApiPropertyOptional({ example: '486' })
  @IsString()
  @IsOptional()
  kodeKlasifikasi?: string;
}

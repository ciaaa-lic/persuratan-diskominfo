import { Module } from '@nestjs/common';
import { KlasifikasiService } from './klasifikasi.service';
import { KlasifikasiController } from './klasifikasi.controller';

@Module({
  controllers: [KlasifikasiController],
  providers: [KlasifikasiService],
  exports: [KlasifikasiService],
})
export class KlasifikasiModule {}

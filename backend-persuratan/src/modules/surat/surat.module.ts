import { Module } from '@nestjs/common';
import { SuratService } from './surat.service';
import { SuratController } from './surat.controller';
import { StokModule } from '../stok/stok.module';
import { LogModule } from '../log/log.module';

@Module({
  imports: [StokModule, LogModule],
  controllers: [SuratController],
  providers: [SuratService],
  exports: [SuratService],
})
export class SuratModule {}

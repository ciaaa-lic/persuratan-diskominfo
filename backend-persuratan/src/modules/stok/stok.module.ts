import { Module } from '@nestjs/common';
import { StokService } from './stok.service';
import { StokController } from './stok.controller';

@Module({
  controllers: [StokController],
  providers: [StokService],
  exports: [StokService],
})
export class StokModule {}

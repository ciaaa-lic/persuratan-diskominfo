import { Module } from '@nestjs/common';
import { LiburService } from './libur.service';
import { LiburController } from './libur.controller';

@Module({
  controllers: [LiburController],
  providers: [LiburService],
  exports: [LiburService],
})
export class LiburModule {}

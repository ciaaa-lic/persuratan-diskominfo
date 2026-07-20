import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StokService } from './stok.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Stok')
@Controller('stok')
export class StokController {
  constructor(private readonly stokService: StokService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async getSummary(@Query('tanggal') tanggal?: string) {
    const targetDateStr = tanggal || new Date().toISOString().split('T')[0];
    return this.stokService.getStokSummary(targetDateStr);
  }
}

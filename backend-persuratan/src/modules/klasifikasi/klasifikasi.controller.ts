import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { KlasifikasiService } from './klasifikasi.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Klasifikasi')
@Controller('klasifikasi')
export class KlasifikasiController {
  constructor(private readonly klasifikasiService: KlasifikasiService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('search') search?: string) {
    return this.klasifikasiService.findAll(search);
  }
}

import { Controller, Get, Post, Delete, Query, Body, Param, UseGuards } from '@nestjs/common';
import { LiburService } from './libur.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Libur')
@Controller('libur')
export class LiburController {
  constructor(private readonly liburService: LiburService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('year') year?: string) {
    const y = year ? parseInt(year, 10) : undefined;
    return this.liburService.findAll(y);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: { tanggal: string; keterangan: string }) {
    return this.liburService.create(body.tanggal, body.keterangan);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':tanggal')
  async remove(@Param('tanggal') tanggal: string) {
    return this.liburService.remove(tanggal);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('sync/:year')
  async sync(@Param('year') year: string) {
    return this.liburService.sync(parseInt(year, 10));
  }
}

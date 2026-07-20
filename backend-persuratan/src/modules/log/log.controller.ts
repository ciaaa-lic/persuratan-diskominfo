import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { LogService } from './log.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

interface AuthenticatedRequest {
  user: {
    name?: string;
    email: string;
    role: string;
  };
}

@ApiTags('Log')
@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('limit') limit?: string) {
    const l = limit ? parseInt(limit, 10) : 100;
    return this.logService.findAll(l);
  }

}

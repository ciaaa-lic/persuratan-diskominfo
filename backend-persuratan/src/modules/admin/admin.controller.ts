import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN') // Endpoint di controller ini HANYA bisa diakses oleh Role ADMIN
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('dashboard')
  async getDashboardData() {
    return this.dashboardService.getStats();
  }
}

import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [DashboardModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

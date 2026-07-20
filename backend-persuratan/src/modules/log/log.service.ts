import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class LogService {
  constructor(private prisma: PrismaService) {}

  async findAll(limit = 100) {
    return this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async createLog(params: {
    userId?: number;
    userName: string;
    role: string;
    action: string;
    description: string;
  }) {
    return this.prisma.activityLog.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        role: params.role,
        action: params.action,
        description: params.description,
      },
    });
  }
}

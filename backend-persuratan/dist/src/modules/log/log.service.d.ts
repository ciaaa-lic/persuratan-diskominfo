import { PrismaService } from '../../core/prisma/prisma.service';
export declare class LogService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(limit?: number): Promise<{
        id: number;
        role: string;
        createdAt: Date;
        description: string;
        userId: number | null;
        userName: string;
        action: string;
    }[]>;
    createLog(params: {
        userId?: number;
        userName: string;
        role: string;
        action: string;
        description: string;
    }): Promise<{
        id: number;
        role: string;
        createdAt: Date;
        description: string;
        userId: number | null;
        userName: string;
        action: string;
    }>;
}

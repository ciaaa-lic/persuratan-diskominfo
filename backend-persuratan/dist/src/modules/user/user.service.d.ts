import { PrismaService } from '../../core/prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    createUser(data: Prisma.UserCreateInput): Promise<{
        id: number;
        email: string;
        password: string;
        name: string;
        role: string;
        bidang: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        id: number;
        email: string;
        password: string;
        name: string;
        role: string;
        bidang: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findById(id: number): Promise<Record<string, unknown> | null>;
    updateProfile(id: number, data: {
        name?: string;
        password?: string;
    }): Promise<Record<string, unknown>>;
    changePassword(id: number, oldPassword?: string, newPassword?: string): Promise<{
        message: string;
    }>;
}

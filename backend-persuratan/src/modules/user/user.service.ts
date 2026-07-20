import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new ConflictException('Email sudah terdaftar');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const result = { ...user } as Record<string, unknown>;
    delete result.password;
    return result;
  }

  async updateProfile(id: number, data: { name?: string; password?: string }) {
    const updateData: Prisma.UserUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
    const result = { ...user } as Record<string, unknown>;
    delete result.password;
    return result;
  }

  async changePassword(id: number, oldPassword?: string, newPassword?: string) {
    if (!oldPassword || !newPassword) {
      throw new BadRequestException('Password lama dan password baru wajib diisi');
    }
    if (newPassword.length < 8) {
      throw new BadRequestException('Password baru minimal 8 karakter');
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Password lama tidak sesuai');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
    return { message: 'Password berhasil diubah' };
  }
}

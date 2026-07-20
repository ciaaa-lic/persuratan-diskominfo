import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

import { LogService } from '../log/log.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private logService: LogService,
  ) {}

  async register(data: Prisma.UserCreateInput) {
    const user = await this.userService.createUser(data);
    await this.logService.createLog({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'Register User',
      description: `Mendaftarkan pengguna baru: ${user.email}`,
    });
    return user;
  }

  async login(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email atau password salah');
    }

    await this.logService.createLog({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'Login',
      description: `User ${user.email} berhasil login ke dalam sistem`,
    });

    const payload = { email: user.email, sub: user.id, role: user.role, bidang: user.bidang };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        bidang: user.bidang,
      },
    };
  }
}

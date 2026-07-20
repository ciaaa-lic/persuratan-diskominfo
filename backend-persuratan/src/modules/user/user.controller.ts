import { Controller, Get, Patch, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

interface AuthenticatedRequest {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.userService.findById(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() body: { name?: string; password?: string },
  ) {
    return this.userService.updateProfile(req.user.userId, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() body: { oldPassword?: string; newPassword?: string },
  ) {
    return this.userService.changePassword(
      req.user.userId,
      body.oldPassword,
      body.newPassword,
    );
  }
}

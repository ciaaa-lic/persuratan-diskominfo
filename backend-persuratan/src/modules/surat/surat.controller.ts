import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { SuratService } from './surat.service';
import { CreateSuratItemDto, CreateSuratBatchDto } from './dto/create-surat.dto';
import { UpdateSuratDto, GenerateNomorDto } from './dto/update-surat.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';

interface AuthenticatedRequest {
  user: {
    userId: number;
    email: string;
    role: string;
    bidang?: string;
  };
}

@ApiTags('Surat')
@Controller('surat')
export class SuratController {
  constructor(private readonly suratService: SuratService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('bidang') bidang?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.suratService.findAll({ bidang, status, search });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('notifications')
  async getNotifications(@Request() req: AuthenticatedRequest) {
    return this.suratService.getNotifications(
      req.user?.userId,
      req.user?.role,
      req.user?.bidang,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('notifications/read')
  async markNotificationsAsRead(@Request() req: AuthenticatedRequest) {
    return this.suratService.markNotificationsAsRead(
      req.user?.userId,
      req.user?.role,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.suratService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: CreateSuratItemDto, @Request() req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    return this.suratService.create(body, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('batch')
  async createBatch(@Body() body: CreateSuratBatchDto, @Request() req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    return this.suratService.createBatch(body.batchList, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateSuratDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.suratService.updateInfo(id, body, req.user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/generate-nomor')
  async generateNomor(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: GenerateNomorDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.userId;
    return this.suratService.generateNomor(id, body.kodeKlasifikasi || '000', userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: AuthenticatedRequest) {
    return this.suratService.remove(id, req.user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { url: null, filename: null };
    }
    return {
      url: `/uploads/${file.filename}`,
      filename: file.originalname,
    };
  }
}

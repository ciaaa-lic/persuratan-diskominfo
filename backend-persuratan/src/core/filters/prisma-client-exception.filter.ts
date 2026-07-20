import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response, Request } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message.replace(/\n/g, '');

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        message = 'Data yang Anda masukkan sudah terdaftar (Unique Constraint Failed)';
        break;
      }
      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        message = 'Data yang Anda cari tidak ditemukan';
        break;
      }
      default:
        // Biarkan default internal server error
        break;
    }

    response.status(status).json({
      status: 'error',
      message: message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

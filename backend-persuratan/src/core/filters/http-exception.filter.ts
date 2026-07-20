import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

interface ExceptionResponseObject {
  message?: string | string[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const obj = exceptionResponse as ExceptionResponseObject;
        message = obj.message || 'Error occurred';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Format error response yang akan diterima Frontend (Konsisten)
    response.status(status).json({
      status: 'error',
      message: Array.isArray(message) ? message[0] : message, // Jika error validasi array, ambil yang pertama
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

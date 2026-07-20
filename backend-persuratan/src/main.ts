import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { PrismaClientExceptionFilter } from './core/filters/prisma-client-exception.filter';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from uploads folder
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // 1. Enable CORS for frontend integration
  app.enableCors();

  // 2. Global Validation Pipe (sebagai pengganti manual Joi/Zod)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Hapus payload yang tidak ada di DTO
      forbidNonWhitelisted: true, // Error jika ada payload aneh
      transform: true, // Otomatis transform string ke number jika di DTO tipenya number
    }),
  );

  // 3. Global Exception Filter (Untuk standardisasi Error Response)
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new PrismaClientExceptionFilter(), // Tangkap error P2002 dll
  );

  // 4. Global Interceptor (Untuk standardisasi Success Response)
  app.useGlobalInterceptors(new TransformInterceptor());

  // 5. OpenAPI Setup (with Scalar UI)
  const config = new DocumentBuilder()
    .setTitle('Backend API')
    .setDescription('API Documentation for Boilerplate')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // Create document as before
  const document = SwaggerModule.createDocument(app, config);

  // Use Scalar instead of Swagger UI

  app.use(
    '/api-docs',
    apiReference({
      spec: {
        content: document,
      },
    }),
  );

  await app.listen(4000);
  console.log(`Application is running on: http://localhost:4000`);
}
void bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: 'https://vtaskmanager.vercel.app/',
    // methods: ['GET', 'POST'],
    credentials: true,
  });
  

  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically strip properties that are not part of the DTO
    forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are sent
    transform: true, // Automatically transform payloads to DTO instances
  }));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Task Manager API')           // API Title
    .setDescription('API for managing tasks') // API Description
    .setVersion('1.0')                       // API Version
    .build();

  // Create Swagger Document
  const document = SwaggerModule.createDocument(app, config);

  // Swagger UI Setup at /api
  SwaggerModule.setup('api', app, document);

  // Start the application on port 3000
  await app.listen(3000);
}
bootstrap();

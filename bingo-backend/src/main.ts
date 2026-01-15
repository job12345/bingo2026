import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SocketIoAdapter } from './websocket/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // WebSocket on separate port (default: 8002)
  app.useWebSocketAdapter(new SocketIoAdapter(app));

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Bingo Party Enterprise API')
    .setDescription('REST API สำหรับระบบเกมบิงโกออนไลน์')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & Authorization')
    .addTag('users', 'User Management')
    .addTag('wallet', 'Wallet & Transactions')
    .addTag('rooms', 'Room Management')
    .addTag('game', 'Game Engine')
    .addTag('admin', 'Admin Panel')
    .addTag('bot', 'Ghost Bot Management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 8001;
  await app.listen(port);

  console.log(`
  ╔════════════════════════════════════════════════════╗
  ║                                                    ║
  ║   🎯 Bingo Party Enterprise Backend API           ║
  ║                                                    ║
  ║   🚀 Server running on: http://localhost:${port}     ║
  ║   📚 API Documentation: http://localhost:${port}/api ║
  ║   🔌 WebSocket Port: ${process.env.WEBSOCKET_PORT || 8002}                    ║
  ║                                                    ║
  ║   Backend Developer: เม 💕                         ║
  ║                                                    ║
  ╚════════════════════════════════════════════════════╝
  `);
}

bootstrap();

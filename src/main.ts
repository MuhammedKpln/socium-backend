import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './exceptions';
import { CrudConfigService } from '@nestjsx/crud';

export class SocketAdapter extends IoAdapter {
  createIOServer(
    port: number,
    options?: ServerOptions & {
      namespace?: string;
      server?: any;
    },
  ) {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST'],
      },
      allowEIO3: false,
      transports: ['websocket', 'polling'],
    });
    return server;
  }
}

async function bootstrap() {
  CrudConfigService.load({
    query: {
      alwaysPaginate: true,
      cache: false,
    },
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useWebSocketAdapter(new SocketAdapter(app));
  // app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  if (process.env.NODE_ENV !== 'production') {
    const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');

    const config = new DocumentBuilder()
      .setTitle('Cats example')
      .setDescription('The cats API description')
      .setVersion('1.0')
      .addTag('cats')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();

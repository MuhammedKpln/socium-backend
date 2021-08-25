import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';

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
        transports: ['websocket', 'polling'],
        methods: ['GET', 'POST'],
      },
      allowEIO3: true,
    });
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useGlobalPipes(new ValidationPipe());
  app.useWebSocketAdapter(new SocketAdapter(app));

  app.enableCors({
    origin: true,
    credentials: true,
  });
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();

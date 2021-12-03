import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { fastifyHelmet } from 'fastify-helmet';
import { createClient } from 'redis';
import { ServerOptions } from 'socket.io';
import { AppModule } from './app.module';

export const redisUrl =
  process.env.NODE_ENV !== 'production'
    ? 'redis://localhost:6379'
    : process.env.REDIS_URL;

export const redisClient = createClient({
  url: redisUrl,
});

export const redisSocketClient = createClient({
  url: redisUrl,
});

const subClient = redisSocketClient.duplicate();

redisSocketClient.on('error', function (error) {
  console.error(error);
});

export class SocketAdapter extends IoAdapter {
  createIOServer(
    port: number,
    options?: ServerOptions & {
      namespace?: string;
      server?: any;
    },
  ) {
    const server = super.createIOServer(3001, {
      ...options,
      cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST'],
      },
      allowEIO3: false,
      transports: ['websocket', 'polling'],
    });

    const redisAdapter = createAdapter(redisSocketClient, subClient);

    server.adapter(redisAdapter);

    return server;
  }
}

async function bootstrap() {
  redisClient.on('error', (err) => console.log('Redis Client Error', err));

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [
          `'self'`,
          `'unsafe-inline'`,
          'cdn.jsdelivr.net',
          'fonts.googleapis.com',
        ],
        fontSrc: [`'self'`, 'fonts.gstatic.com'],
        imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`, `cdn.jsdelivr.net`],
      },
    },
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useWebSocketAdapter(new SocketAdapter(app));

  // app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();

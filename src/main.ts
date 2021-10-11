import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { readFile } from 'fs/promises';
import * as redis from 'redis';
import { ServerOptions } from 'socket.io';
import { AppModule } from './app.module';

export const redisUrl =
  process.env.NODE_ENV !== 'production' ? null : process.env.REDIS_URL;

export const redisClient = redis.createClient({
  url: redisUrl,
});

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
  await redisClient.connect();
  redisClient.on('error', (err) => console.log('Redis Client Error', err));

  const badWordsJson = await readFile(__dirname + '/data/badWords.json');
  const badWords: string[] = JSON.parse(Buffer.from(badWordsJson).toString());

  badWords.forEach((badWord) => {
    redisClient.set(badWord, badWord);
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useWebSocketAdapter(new SocketAdapter(app));

  // app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();

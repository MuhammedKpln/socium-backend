import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { createClient } from 'redis';
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

redisSocketClient.on('error', function (error) {
  console.error(error);
});

async function bootstrap() {
  redisClient.on('error', (err) => console.log('Redis Client Error', err));

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();

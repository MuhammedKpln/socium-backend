import { Module } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';

export const PUB_SUB = 'PUB_SUB';

@Module({
  providers: [
    {
      provide: PUB_SUB,
      useFactory: () => {
        return new RedisPubSub({
          connection: {
            host: process.env.REDIS_HOST || '127.0.01',
            port: parseInt(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            db: 2,
          },
        });
      },
    },
  ],
  exports: [PUB_SUB],
})
export class PubsubModule {}

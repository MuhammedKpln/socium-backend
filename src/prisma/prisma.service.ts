import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { createPostLikeEntity } from './hooks/Comment/createPostLikeEntity';
import { generateStarEntity } from './hooks/User/generateStarEntity';
import { hashPasswordMiddleware } from './hooks/User/hashPassword';
import { generateRandomEmailConfirmationCode } from './hooks/User/randomEmailCodeGen';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    this.$use(async (params, next) => {
      let p: Prisma.MiddlewareParams = params;

      // User Model On Create/Update Hooks
      if (
        (params.action == 'create' || params.action == 'update') &&
        params.model === 'User'
      ) {
        p = await hashPasswordMiddleware(p);
        p = await generateStarEntity(p, this);
        p = generateRandomEmailConfirmationCode(p);
      }

      if (params.action == 'create' && params.model === 'Comment') {
        p = await createPostLikeEntity(p, this);
      }

      return await next(p);
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}

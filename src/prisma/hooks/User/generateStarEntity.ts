import { Prisma, PrismaClient, User } from '@prisma/client';
import { P } from 'src/types';

export async function generateStarEntity(
  params: Prisma.MiddlewareParams,
  prisma: PrismaClient,
): P<Prisma.MiddlewareParams> {
  const user: User = params.args.data;

  if (user?.password) {
    await prisma.star.create({
      data: {
        userId: user.id,
      },
    });
  }

  return params;
}

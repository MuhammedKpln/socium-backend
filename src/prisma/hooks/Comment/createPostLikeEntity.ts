import { Comment, Prisma, PrismaClient, User } from '@prisma/client';
import { P } from 'src/types';

export async function createPostLikeEntity(
  params: Prisma.MiddlewareParams,
  prisma: PrismaClient,
): P<Prisma.MiddlewareParams> {
  const comment: Comment = params.args.data;

  const postLike = await prisma.postLike.create({
    data: {
      comment: {
        connect: comment,
      },
    },
  });

  params.args.postLikeId = postLike.id;

  return params;
}

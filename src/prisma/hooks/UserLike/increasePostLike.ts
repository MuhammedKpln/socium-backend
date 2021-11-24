import { Comment, Posts, Prisma, PrismaClient, UserLike } from '@prisma/client';
import { P } from 'src/types';

export async function increasePostLike(
  params: Prisma.MiddlewareParams,
  prisma: PrismaClient,
): P<Prisma.MiddlewareParams> {
  const entity: UserLike & {
    post?: Posts;
    comment?: Comment;
  } = params.args.data;

  if (entity?.postId) {
    const postLike = await prisma.postLike.findFirst({
      where: {
        post: {
          id: entity.id,
        },
      },
    });

    await prisma.postLike.update({
      data: {
        likeCount: postLike.likeCount + 1,
      },
      where: {
        id: postLike.id,
      },
    });
  }

  if (entity?.commentId) {
    const postLike = await prisma.postLike.findFirst({
      where: {
        comment: {
          id: entity.id,
        },
      },
    });

    await prisma.postLike.update({
      data: {
        likeCount: postLike.likeCount + 1,
      },
      where: {
        id: postLike.id,
      },
    });
  }

  return params;
}

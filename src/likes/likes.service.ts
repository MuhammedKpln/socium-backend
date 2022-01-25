import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  async likePost(user: User, postId: number) {
    return await this.prisma.postLike.update({
      data: {
        likeCount: {
          increment: 1,
        },
        userLike: {
          connectOrCreate: {
            create: {
              postId,
              userId: user.id,
              liked: true,
            },
            where: {
              postId,
            },
          },
        },
      },
      where: {
        postId,
      },
      include: {
        userLike: true,
      },
    });
  }

  async unlikePost(postId: number, user: User) {
    const likeEntity = await this.prisma.userLike.findFirst({
      where: {
        postId,
        userId: user.id,
      },
    });

    if (likeEntity) {
      const deleteEntity = await this.prisma.userLike.delete({
        where: {
          id: likeEntity.id,
        },
      });

      if (deleteEntity) {
        const postLike = await this.prisma.postLike.update({
          where: {
            postId,
          },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
          include: {
            userLike: true,
          },
        });

        return postLike;
      }

      throw new Error("Can't unlike post");
    }
    throw new Error("Can't unlike post");
  }
  async likeComment(user: User, commentId: number) {
    return await this.prisma.postLike.update({
      data: {
        likeCount: {
          increment: 1,
        },
        userLike: {
          connectOrCreate: {
            create: {
              commentId,
              userId: user.id,
              liked: true,
            },
            where: {
              commentId,
            },
          },
        },
      },
      where: {
        commentId,
      },
      include: {
        userLike: true,
      },
    });
  }

  async unlikeComment(commentId: number, user: User) {
    const likeEntity = await this.prisma.userLike.findFirst({
      where: {
        commentId,
        userId: user.id,
      },
    });

    if (likeEntity) {
      const deleteEntity = await this.prisma.userLike.delete({
        where: {
          id: likeEntity.id,
        },
      });

      if (deleteEntity) {
        const postLike = await this.prisma.postLike.update({
          where: {
            commentId,
          },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
          include: {
            userLike: true,
          },
        });

        return postLike;
      }
    }

    throw new Error("Can't unlike comment");
  }
}

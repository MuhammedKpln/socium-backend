import { Injectable } from '@nestjs/common';
import { Comment } from '@prisma/client';
import { User } from 'src/auth/entities/user.entity';
import { PaginationParams } from 'src/inputypes/pagination.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { P, PBool } from 'src/types';
import { CreteNewCommentDto } from './dtos/CreateNewComment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async getCommentById(id: number) {
    return await this.prisma.comment.findUnique({
      where: { id },
      include: {
        post: {
          include: {
            user: true,
            postLike: true,
            userLike: true,
          },
        },
        postLike: true,
        userLike: true,
        user: true,
      },
    });
  }

  async _getPostComments(
    postId: number,
    option: PaginationParams,
  ): P<Comment[]> {
    const comments = await this.prisma.comment.findMany({
      where: {
        postId,
        parentCommentId: null,
      },
      skip: option.offset,
      take: option.limit,
      include: {
        post: {
          include: {
            user: true,
            postLike: true,
            userLike: true,
          },
        },
        postLike: true,
        userLike: true,
        user: true,
        parentComments: {
          include: {
            postLike: true,
            user: true,
            userLike: true,
          },
        },
      },
    });

    return comments;
  }

  async getUserComments(
    userId: number,
    option: PaginationParams,
  ): P<Comment[]> {
    const comments = await this.prisma.comment.findMany({
      where: {
        userId,
      },
      skip: option.offset,
      take: option.limit,
      include: {
        post: {
          include: {
            user: true,
            postLike: true,
            userLike: true,
          },
        },
        postLike: true,
        userLike: true,
        user: true,
        parentComments: {
          include: {
            parentComments: {
              include: {
                postLike: true,
                user: true,
                userLike: true,
              },
            },
          },
        },
      },
    });

    return comments;
  }

  async createEntity(
    postId: number,
    parentId: number,
    entity: CreteNewCommentDto,
    user: User,
  ) {
    const model = await this.prisma.comment.create({
      data: {
        ...entity,
        postId,
        parentCommentId: parentId,
        userId: user.id,
        postLike: {
          create: {},
        },
      },
      include: {
        post: {
          include: {
            user: true,
          },
        },
        postLike: true,
        userLike: true,
        user: true,
        parentComment: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    return model;
  }

  async removeComment(commentId: number): PBool {
    const deleted = await this.prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    if (deleted) {
      return true;
    }

    return false;
  }
}

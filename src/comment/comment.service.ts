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
    return await this.prisma.comment.findMany({
      where: {
        postId,
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
      },
    });
  }

  async createEntity(postId: number, entity: CreteNewCommentDto, user: User) {
    const model = await this.prisma.comment.create({
      data: {
        ...entity,
        postId,
        userId: user.id,
      },
    });

    if (model) {
      await this.prisma.postLike.create({
        data: {
          commentId: model.id,
        },
      });
    }

    return this.getCommentById(model.id);
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

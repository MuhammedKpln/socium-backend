import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { PBool } from 'src/types';
import { Repository } from 'typeorm';
import { UserLike } from './entities/UserLike.entity';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  async likePost(user: User, postId: number) {
    return await this.prisma.userLike.create({
      data: {
        postId,
        userId: user.id,
        liked: true,
      },
    });
  }

  async unlikePost(postId: number, user: User): PBool {
    const likeEntity = await this.prisma.userLike.findFirst({
      where: {
        postId,
        userId: user.id,
      },
      include: {
        post: true,
      },
    });

    if (likeEntity) {
      const deleteEntity = await this.prisma.userLike.delete({
        where: {
          id: likeEntity.id,
        },
      });

      if (deleteEntity) {
        return true;
      }

      return false;
    }

    return false;
  }
  async likeComment(user: User, commentId: number) {
    return await this.prisma.userLike.create({
      data: {
        commentId,
        userId: user.id,
        liked: true,
      },
    });
  }

  async unlikeComment(commentId: number, user: User) {
    const likeEntity = await this.prisma.userLike.findFirst({
      where: {
        commentId,
        userId: user.id,
      },
      include: {
        comment: true,
      },
    });

    if (likeEntity) {
      const deleteEntity = await this.prisma.userLike.delete({
        where: {
          id: likeEntity.id,
        },
      });

      if (deleteEntity) {
        return true;
      }

      return false;
    }

    return false;
  }
}

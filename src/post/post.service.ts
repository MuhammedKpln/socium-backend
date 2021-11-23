import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from '@prisma/client';
import * as shuffleArray from 'lodash.shuffle';
import { User } from 'src/auth/entities/user.entity';
import { PaginationParams } from 'src/inputypes/pagination.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { P } from 'src/types';
import { CreatePostDto } from './dtos/createPost';
import { PostEntity } from './entities/post.entity';

const essentialDatabaseOptions = {
  include: {
    user_like: true,
    post_like: true,
    user: true,
    _count: {
      select: {
        comment: true,
      },
    },
  },
};

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly prisma: PrismaService,
  ) {}

  async getAllPosts(
    pagination: PaginationParams,
    blogPosts?: boolean,
  ): Promise<Posts[]> {
    const randomPosts = await this.prisma.posts.findMany({
      ...essentialDatabaseOptions,
      take: pagination.limit,
      skip: pagination.offset,
      where: {
        type: blogPosts ? { equals: 4 } : { not: 4 },
      },
    });

    return shuffleArray(randomPosts);
  }

  async getAllPostsFromUser(username: string): P<Posts[]> {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const posts = await this.prisma.posts.findMany({
      where: {
        userId: user.id,
      },
      ...essentialDatabaseOptions,
    });

    return posts;
  }

  async getUserLikedPosts(userId: number): P<Posts[]> {
    return await this.prisma.posts.findMany({
      where: {
        userId,
      },
      ...essentialDatabaseOptions,
    });
  }

  private async getOneBySlug(slug: string): P<Posts> {
    const post = await this.prisma.posts.findUnique({
      where: {
        slug,
      },
      ...essentialDatabaseOptions,
    });

    if (post) {
      return post;
    }

    throw new NotFoundException('Post not found');
  }

  private async getOneById(id: number): P<Posts> {
    const post = await this.prisma.posts.findUnique({
      where: {
        id,
      },
      ...essentialDatabaseOptions,
    });

    if (post) {
      return post;
    }

    throw new NotFoundException('Post not found');
  }

  async getPostById(id: number): P<Posts> {
    const post = await this.getOneById(id);

    return post;
  }

  async createPost(post: CreatePostDto, user: User) {
    const save = await this.prisma.posts.create({
      data: {
        ...post,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
      ...essentialDatabaseOptions,
    });

    if (save) {
      return save;
    }

    throw new Error('Could not create post');
  }

  async removePost(postId: number, user: User) {
    const post = await this.getOneById(postId);

    if (post) {
      if (post.userId !== user.id) {
        throw new Error('This post does not belongs to you');
      }

      await this.prisma.posts.delete({
        where: {
          id: postId,
        },
      });

      return true;
    } else {
      throw new NotFoundException();
    }
  }
}

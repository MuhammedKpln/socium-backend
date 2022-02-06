import { Injectable, NotFoundException } from '@nestjs/common';
import { Posts } from '@prisma/client';
import slugify from 'slugify';
import { User } from 'src/auth/entities/user.entity';
import { getRandomString } from 'src/helpers/randomString';
import { PaginationParams } from 'src/inputypes/pagination.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { P } from 'src/types';
import { CreatePostDto } from './dtos/createPost';

const essentialDatabaseOptions = {
  include: {
    category: true,
    userLike: true,
    postLike: true,
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
  constructor(private readonly prisma: PrismaService) {}

  async getAllPosts(
    pagination: PaginationParams,
    user?: User,
  ): Promise<Posts[]> {
    const posts = await this.prisma.posts.findMany({
      take: pagination.limit,
      skip: pagination.offset,
      ...essentialDatabaseOptions,
    });

    if (user) {
      const postsWithFollowedAuthors = posts.map(async (post) => {
        const isFollowed = await this.prisma.follower.findFirst({
          where: {
            userId: user.id,
            actorId: post.userId,
          },
          select: {
            actorId: true,
            userId: true,
          },
        });

        return { ...post, isFollowed };
      });

      return Promise.all(postsWithFollowedAuthors);
    }

    return posts;
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

  //TODO: does not work
  async getUserLikedPosts(userId: number): P<Posts[]> {
    return await this.prisma.posts.findMany({
      where: {
        userId,
        userLike: {
          userId,
          liked: true,
        },
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
        userId: user.id,
        slug: slugify(getRandomString(100)),
      },
      ...essentialDatabaseOptions,
    });

    if (save) {
      const createPostlike = await this.prisma.postLike.create({
        data: {
          postId: save.id,
        },
      });

      if (createPostlike) {
        return await this.getOneBySlug(save.slug);
      }
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

  async getPostsByCategoryId(categoryId: number, pagination: PaginationParams) {
    return await this.prisma.posts.findMany({
      where: {
        categoryId,
      },
      ...essentialDatabaseOptions,
      take: pagination.limit,
      skip: pagination.offset,
    });
  }

  async getMostLikedPosts(pagination: PaginationParams) {
    return await this.prisma.posts.findMany({
      orderBy: {
        postLike: {
          likeCount: 'desc',
        },
      },
      take: pagination.limit,
      skip: pagination.offset,
      ...essentialDatabaseOptions,
    });
  }
}

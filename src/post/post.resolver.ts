import {
  Inject,
  NotAcceptableException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { stripHtml } from 'src/helpers';
import { PaginationParams } from 'src/inputypes/pagination.input';
import {
  fetchInstagramMetaData,
  fetchTwitterMetaData,
  fetchYoutubeMetaData,
} from 'src/likes/utils/fetchMetaData';
import { PUB_SUB } from 'src/pubsub/pubsub.module';
import { CreatePostDto } from './dtos/createPost';
import { PostEntity, PostType } from './entities/post.entity';
import { PostService } from './post.service';
import { CREATED_POST } from './pubsub.events';
import type { Posts } from '@prisma/client';
import { P } from 'src/types';

@Resolver((of) => PostEntity)
export class PostsResolver {
  constructor(
    private readonly postService: PostService,
    @Inject(PUB_SUB) private readonly pubSub: RedisPubSub,
  ) {}

  @Query((returns) => [PostEntity])
  async posts(
    @Args('categoryId', { nullable: true }) categoryId: number,
    @Args('pagination') pagination: PaginationParams,
    @UserDecorator() user: User,
  ): Promise<Posts[]> {
    if (categoryId) {
      return await this.postService.getPostsByCategoryId(
        categoryId,
        pagination,
      );
    }
    return await this.postService.getAllPosts(pagination);
  }

  @Query((returns) => [PostEntity])
  async postsWithoutBlog(
    @Args('pagination') pagination: PaginationParams,
    @UserDecorator() user: User,
  ): Promise<Posts[]> {
    return await this.postService.getAllPosts(pagination, false);
  }
  @Query((returns) => [PostEntity])
  async postsOnlyBlog(
    @Args('pagination') pagination: PaginationParams,
    @UserDecorator() user: User,
  ): Promise<Posts[]> {
    return await this.postService.getAllPosts(pagination, true);
  }

  @Query((returns) => PostEntity)
  async post(@Args('id') id: number): P<Posts> {
    const recipe = await this.postService.getPostById(id);
    if (!recipe) {
      throw new NotFoundException(id);
    }
    return recipe;
  }

  @Query((_returns) => [PostEntity])
  @UseGuards(JwtAuthGuard)
  async getLikedPosts(@UserDecorator() user: User) {
    const stars = await this.postService.getUserLikedPosts(user.id);

    if (stars) {
      return stars;
    }
  }

  @Mutation((_returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async removePost(
    @Args('postId') postId: number,
    @UserDecorator() user: User,
  ) {
    const remove = await this.postService.removePost(postId, user);

    if (remove) {
      return true;
    }

    return false;
  }

  @Query((returns) => [PostEntity])
  async userPosts(
    @Args('username', { nullable: false, type: () => String }) username: string,
  ): Promise<Posts[]> {
    const recipe = await this.postService.getAllPostsFromUser(username);
    if (!recipe) {
      throw new NotFoundException(username);
    }

    return recipe;
  }

  @Mutation((returns) => PostEntity)
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Args('post') post: CreatePostDto,
    @UserDecorator() user: User,
  ) {
    const postContent: string = post?.title;

    if (postContent.includes('http') || post?.title?.includes('http')) {
      if (post.type === PostType.Content || post.type === PostType.Blog) {
        throw new NotAcceptableException();
      }
    }

    if (post.type === PostType.Youtube) {
      let videoId: string;

      if (postContent.includes('youtu.be')) {
        videoId = postContent.split('https://youtu.be/')[1];
      }
      if (postContent.includes('watch?v=')) {
        videoId = postContent.split('watch?v=')[1];
      }

      const youtubeMetaData = await fetchYoutubeMetaData(videoId);
      post.title = youtubeMetaData.title;
      post.content = postContent;
    }

    if (post.type === PostType.Twitter) {
      const twitterMetaData = await fetchTwitterMetaData(postContent);
      const text: string = stripHtml(twitterMetaData.html);
      let title: string;
      if (text.includes('pic.twitter.com')) {
        title = text.split('pic.twitter.com')[0];
      } else {
        title = text.split('—')[0];
      }
      post.title = title;
      post.content = postContent;
    }

    if (post.type === PostType.Instagram) {
      const instagramMetaData = await fetchInstagramMetaData(postContent);
      const thumbnailUrl: string = instagramMetaData.thumbnail_url;

      post.title = thumbnailUrl;
      post.content = postContent;
    }

    const postModel = await this.postService
      .createPost(post, user)
      .catch((err) => {
        console.log(err);
        throw new NotAcceptableException();
      });

    if (postModel.type !== PostType.Blog) {
      this.pubSub.publish(CREATED_POST, {
        createdNewPost: postModel,
      });
    }

    return postModel;
  }

  @Subscription((_returns) => PostEntity)
  createdNewPost() {
    return this.pubSub.asyncIterator(CREATED_POST);
  }
}

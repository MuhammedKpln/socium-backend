import {
  NotAcceptableException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { stripHtml } from 'src/helpers';
import {
  fetchTwitterMetaData,
  fetchYoutubeMetaData,
} from 'src/likes/utils/fetchMetaData';
import { CreatePostDto } from './dtos/createPost';
import { PostEntity, PostType } from './entities/post.entity';
import { PostService } from './post.service';

@Resolver((of) => PostEntity)
export class PostsResolver {
  constructor(private readonly postService: PostService) {}

  @Query((returns) => [PostEntity])
  async posts(
    @Args('page', { nullable: true, type: () => Number }) page: number,
  ): Promise<PostEntity[] | PostEntity> {
    const posts = await this.postService.getAllPosts();

    return posts;
  }
  @Query((returns) => PostEntity)
  async post(@Args('id') id: number): Promise<PostEntity> {
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
  ): Promise<PostEntity[]> {
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
    const postContent: string = post?.content;
    let videoId: string;

    if (postContent.includes('youtu.be')) {
      videoId = postContent.split('https://youtu.be/')[1];
    }
    if (postContent.includes('watch?v=')) {
      videoId = postContent.split('watch?v=')[1];
    }

    if (post.type === PostType.Youtube) {
      const youtubeMetaData = await fetchYoutubeMetaData(videoId);
      post.content = `youtube##${postContent}##${youtubeMetaData.title}`;
    }

    if (post.type === PostType.Twitter) {
      const twitterMetaData = await fetchTwitterMetaData(postContent);
      const text = stripHtml(twitterMetaData.html);

      post.content = `twitter##${postContent}##${text}`;
    }

    return await this.postService.createPost(post, user).catch((err) => {
      console.log(err);
      throw new NotAcceptableException();
    });
  }
}

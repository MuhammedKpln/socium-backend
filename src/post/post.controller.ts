import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from 'src/auth/decorators/user.decorator';
import { User as UserEntity } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { stripHtml } from 'src/helpers';
import { notFound, response } from 'src/helpers/response';
import {
  fetchTwitterMetaData,
  fetchYoutubeMetaData,
} from 'src/likes/utils/fetchMetaData';
import { CreatePostDto } from './dtos/createPost';
import { PostType } from './entities/post.entity';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Get()
  async index(
    @Query('username') username,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Req() req: Request,
  ) {
    limit = parseInt(process.env.PAGINATION_LIMIT) || limit;
    let routePath = req.url;

    if (username) {
      const posts = await this.postService.getByUsername(username, {
        page,
        limit,
        route: routePath,
      });

      if (!posts) {
        return notFound();
      }

      return response(posts);
    }

    return this.postService.paginate({
      page,
      limit,
      route: routePath,
    });
  }

  @Get(':slug')
  async getPost(@Param('slug') slug: string) {
    const post = await this.postService.getPost(slug);

    if (post) {
      return post;
    }

    return notFound();
  }

  getUserPosts(
    @Query('username') username,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Req() req: Request,
  ) {
    limit = parseInt(process.env.PAGINATION_LIMIT) || limit;
    let routePath = req.url;

    return this.postService.getByUsername(username, {
      page,
      limit,
      route: routePath,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPost(@Body() post: CreatePostDto, @User() user: UserEntity) {
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

    return this.postService.createPost(post, user).catch((err) => {
      console.log(err);
      throw new HttpException(
        {
          status: false,
        },
        HttpStatus.NOT_ACCEPTABLE,
      );
    });
  }
}

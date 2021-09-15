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
import { notFound, response } from 'src/helpers/response';
import { CreatePostDto } from './dtos/createPost';
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
  createPost(@Body() post: CreatePostDto, @User() user: UserEntity) {
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

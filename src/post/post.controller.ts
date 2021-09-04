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
import { CreatePostDto } from './dtos/createPost';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Get()
  async index(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Req() req: Request,
  ) {
    limit = parseInt(process.env.PAGINATION_LIMIT) || limit;
    let routePath = req.url;

    return this.postService.paginate({
      page,
      limit,
      route: routePath,
    });
  }

  @Get('/:username')
  getUserPosts(
    @Param('username') username,
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
function PATH_METADATA(PATH_METADATA: any, StaticController: any) {
  throw new Error('Function not implemented.');
}

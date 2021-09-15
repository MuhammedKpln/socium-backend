import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CommentService } from './comment.service';
import { CreteNewCommentDto } from './dtos/CreateNewComment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentsService: CommentService) {}

  @Get()
  async getComments(
    @Query('post', new DefaultValuePipe(1), ParseIntPipe) postId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Req() req,
  ) {
    limit = parseInt(process.env.PAGINATION_LIMIT) || limit;
    let routePath = req.url;

    return await this.commentsService.getPostComments(postId, {
      page,
      limit,
      route: routePath,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async newComment(
    @Query('post', new DefaultValuePipe(1), ParseIntPipe) postId: number,
    @UserDecorator() user: User,
    @Body() body: CreteNewCommentDto,
  ) {
    return await this.commentsService.createEntity(postId, body, user);
  }
}

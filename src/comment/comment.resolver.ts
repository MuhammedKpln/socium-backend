import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { PaginationParams } from 'src/inputypes/pagination.input';
import { CommentService } from './comment.service';
import { CreteNewCommentDto } from './dtos/CreateNewComment.dto';
import { Comment } from './entities/comment.entity';

@Resolver((of) => Comment)
export class CommentResolver {
  constructor(private readonly commentsService: CommentService) {}

  @Query((returns) => [Comment])
  async getPostComments(
    @Args('postId') post: number,
    @Args('pagination') pagination: PaginationParams,
  ) {
    const posts = await this.commentsService._getPostComments(post, pagination);

    return posts;
  }

  @Mutation((returns) => Comment)
  @UseGuards(JwtAuthGuard)
  async newComment(
    @Args('postId') postId: number,
    @Args('data') comment: CreteNewCommentDto,
    @UserDecorator() user: User,
  ) {
    return await this.commentsService.createEntity(postId, comment, user);
  }
}

import { Inject, NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { PaginationParams } from 'src/inputypes/pagination.input';
import { PUB_SUB } from 'src/pubsub/pubsub.module';
import { CommentService } from './comment.service';
import { CreteNewCommentDto } from './dtos/CreateNewComment.dto';
import { Comment } from './entities/comment.entity';
import { NEW_COMMENT_EVENT } from './events.pubsub';

@Resolver((of) => Comment)
export class CommentResolver {
  constructor(
    private readonly commentsService: CommentService,
    @Inject(PUB_SUB) private pubSub: PubSub,
  ) {}

  @Query((returns) => [Comment])
  async getPostComments(
    @Args('postId') post: number,
    @Args('pagination') pagination: PaginationParams,
  ) {
    const posts = await this.commentsService._getPostComments(post, pagination);

    return posts;
  }

  @Subscription((_returns) => Comment, {
    filter: (payload, variables) => {
      console.log(payload);
      return payload.newCommentPublished.post.slug === variables.postSlug;
    },
  })
  newCommentPublished(@Args('postSlug') postSlug: string) {
    return this.pubSub.asyncIterator(NEW_COMMENT_EVENT);
  }

  @Mutation((returns) => Comment)
  @UseGuards(JwtAuthGuard)
  async newComment(
    @Args('postId') postId: number,
    @Args('data') comment: CreteNewCommentDto,
    @UserDecorator() user: User,
  ) {
    const commentEntity = await this.commentsService.createEntity(
      postId,
      comment,
      user,
    );
    this.pubSub.publish(NEW_COMMENT_EVENT, {
      newCommentPublished: commentEntity,
    });

    return commentEntity;
  }
}

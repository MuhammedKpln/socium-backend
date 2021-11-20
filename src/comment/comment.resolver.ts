import { InjectQueue } from '@nestjs/bull';
import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Queue } from 'bull';
import { PubSub } from 'graphql-subscriptions';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { PaginationParams } from 'src/inputypes/pagination.input';
import { INotificationEntity } from 'src/notification/entities/notification.entity';
import { NotificationType } from 'src/notification/entities/notification.type';
import { INotificationJobData } from 'src/notification/providers/Notification.consumer';
import { PUB_SUB } from 'src/pubsub/pubsub.module';
import { Queues } from 'src/types';
import { CommentService } from './comment.service';
import { CreteNewCommentDto } from './dtos/CreateNewComment.dto';
import { Comment } from './entities/comment.entity';
import { NEW_COMMENT_EVENT } from './events.pubsub';

@Resolver((of) => Comment)
export class CommentResolver {
  constructor(
    private readonly commentsService: CommentService,
    @Inject(PUB_SUB) private pubSub: PubSub,
    @InjectQueue(Queues.Notification)
    private readonly notification: Queue<INotificationJobData>,
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

    await this.notification.add(Queues.SendNotification, {
      fromUser: user,
      toUser: commentEntity.post.user.id,
      notificationType: NotificationType.CommentedToPost,
      entityId: postId,
      entityType: INotificationEntity.Post,
      body: comment.content,
    });

    await this.pubSub.publish(NEW_COMMENT_EVENT, {
      newCommentPublished: commentEntity,
    });

    return commentEntity;
  }

  @Mutation((returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async removeComment(@Args('commentId') commentId: number) {
    return await this.commentsService.removeComment(commentId);
  }
}

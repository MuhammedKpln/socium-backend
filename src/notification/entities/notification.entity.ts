import { createUnionType, Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Follower } from 'src/follower/entities/follower.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { NotificationType } from './notification.type';

export type INotificationEntityTypes =
  | INotificationEntity.Post
  | INotificationEntity.Follower;

export enum INotificationEntity {
  Post = 'post',
  Follower = 'follower',
}

const gqlEntityType = createUnionType({
  name: 'entity',
  types: () => [Comment, PostEntity, Follower],
});

@ObjectType()
export class Notification extends BaseStruct {
  @Field((_returns) => User)
  user: User;

  @Field((_returns) => User)
  actor: User;

  @Field()
  notificationType: NotificationType;

  @Field()
  entityId: number;

  @Field()
  entityType: INotificationEntityTypes;

  @Field()
  readed: boolean;

  @Field((_returns) => gqlEntityType)
  entity: PostEntity | Comment | Follower;
}

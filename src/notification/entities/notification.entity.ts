import { createUnionType, Field, ObjectType } from '@nestjs/graphql';
import { Follower, Posts } from '@prisma/client';
import { User } from 'src/auth/entities/user.entity';
import { Follower as FollowerEntity } from 'src/follower/entities/follower.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { NotificationType } from './notification.type';

export type INotificationEntityTypes =
  | INotificationEntity.Post
  | INotificationEntity.Follower
  | INotificationEntity.MessageRequest;

export enum INotificationEntity {
  Post = 'post',
  Follower = 'follower',
  MessageRequest = 'user',
}

const gqlEntityType = createUnionType({
  name: 'entity',
  types: () => [PostEntity, FollowerEntity],
  resolveType: (value) => {
    if (value?.actor) {
      return FollowerEntity;
    }
    if (value?.title || value?.content) {
      return PostEntity;
    }
  },
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
  entity: Follower | Posts;
}

@ObjectType()
export class NotificationSettingsEntity extends BaseStruct {
  @Field()
  follower: boolean;
  @Field()
  messageRequest: boolean;
  @Field()
  comments: boolean;
  @Field()
  disableAll: boolean;
  @Field()
  user: User;
}

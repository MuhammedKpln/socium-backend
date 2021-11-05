import { createUnionType, Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Follower } from 'src/follower/entities/follower.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { AfterLoad, Column, Entity, getRepository, ManyToOne } from 'typeorm';
import { NotificationType } from './notification.type';

export type INotificationEntityTypes =
  | INotificationEntity.Post
  | INotificationEntity.User;

export enum INotificationEntity {
  Post = 'post',
  User = 'user',
}

const gqlEntityType = createUnionType({
  name: 'entity',
  types: () => [Comment, PostEntity, Follower],
});

@Entity()
@ObjectType()
export class Notification extends BaseStruct {
  @ManyToOne(() => User, (user) => user.id, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @Field((_returns) => User)
  user: User;

  @ManyToOne(() => User, (user) => user.id, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @Field((_returns) => User)
  actor: User;

  @Column()
  @Field()
  notificationType: NotificationType;

  @Column()
  @Field()
  entityId: number;

  @Column({ type: 'varchar' })
  @Field()
  entityType: INotificationEntityTypes;

  @Column({ type: 'boolean', default: false })
  @Field()
  readed: boolean;

  @Field((_returns) => gqlEntityType)
  entity: PostEntity | Comment | Follower;

  @AfterLoad()
  async selam() {
    switch (this.entityType) {
      case INotificationEntity.Post:
        const repo = getRepository(PostEntity);
        const post = await repo.findOne(
          { id: this.entityId },
          { loadEagerRelations: true },
        );

        this.entity = post;
        break;

      case INotificationEntity.User:
        const followerRepo = getRepository(Follower);
        const followerEntity = await followerRepo.findOne(
          {
            id: this.entityId,
          },
          { relations: ['actor', 'user'] },
        );

        this.entity = followerEntity;
        break;
    }
  }
}

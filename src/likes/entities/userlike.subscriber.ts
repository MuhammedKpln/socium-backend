import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  Repository,
} from 'typeorm';
import { PostLike } from './PostLike.entity';
import { UserLike } from './UserLike.entity';

@EventSubscriber()
export class UserLikeSubscriber implements EntitySubscriberInterface<UserLike> {
  constructor(
    @InjectConnection() readonly connection: Connection,
    @InjectRepository(PostLike)
    private readonly postLikeRepo: Repository<PostLike>,
  ) {
    connection.subscribers.push(this); // <---- THIS
  }

  /**
   * Indicates that event.entity subscriber only listen to Post events.
   */
  listenTo() {
    return UserLike;
  }

  async beforeRemove(event: RemoveEvent<UserLike>) {
    console.log(event.entity);

    let m;
    if (event.entity?.post?.id) {
      m = event.entity.post.postLike.id;
    } else {
      m = event.entity.comment.postLike.id;
    }

    const model = await this.postLikeRepo.findOne({ id: m });

    await this.postLikeRepo.update(
      { id: m },
      {
        likeCount: model.likeCount - 1,
      },
    );
  }

  async afterInsert(event: InsertEvent<UserLike>) {
    let m;
    if (event.entity.post) {
      m = event.entity.post.postLike.id;
    } else {
      m = event.entity.comment.postLike.id;
    }
    try {
      const model = await this.postLikeRepo.findOne({ id: m });

      await this.postLikeRepo.update(
        {
          id: model.id,
        },
        {
          likeCount: model.likeCount + 1,
        },
      );
    } catch (error) {
      console.log('err1', error);
    }
  }
}

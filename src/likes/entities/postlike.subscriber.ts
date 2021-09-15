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

  async afterRemove(event: RemoveEvent<UserLike>) {
    const id = event.entity?.post?.id || event.entity?.comment?.id;
    let m;
    if (event.entity?.post?.id) {
      m = {
        post: id,
      };
    } else {
      m = {
        commment: id,
      };
    }

    const model = await this.postLikeRepo.findOne(m);
    await this.postLikeRepo.update(m, {
      likeCount: model.likeCount - 1,
    });
  }

  async beforeInsert(event: InsertEvent<UserLike>) {
    let m;
    if (event.entity.post) {
      m = {
        post: event.entity.post,
      };
    } else {
      m = {
        comment: event.entity.comment,
      };
    }

    const model = await this.postLikeRepo.findOne(m);

    if (model) {
      console.log('selam', model);
      event.entity.postLike = model;
    } else {
      console.log('Geldim buradayim');
      try {
        const newPostLikeObject = await this.postLikeRepo.create({
          ...m,
          likeCount: 0,
        });

        await this.postLikeRepo.save(newPostLikeObject);

        return this.beforeInsert(event);
      } catch (error) {
        console.log('err', error);
      }
    }
  }

  async afterInsert(event: InsertEvent<UserLike>) {
    let m;
    if (event.entity.post) {
      m = {
        post: event.entity.post,
      };
    } else {
      m = {
        comment: event.entity.comment,
      };
    }
    try {
      const model = await this.postLikeRepo.findOne(m);

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

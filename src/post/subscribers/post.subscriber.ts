import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { PostLike } from 'src/likes/entities/PostLike.entity';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  Repository,
} from 'typeorm';
import { PostEntity } from '../entities/post.entity';

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<PostEntity> {
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
    return PostEntity;
  }

  async afterInsert(event: InsertEvent<PostEntity>) {
    const model = await this.postLikeRepo.create({
      post: event.entity,
      likeCount: 0,
    });

    await this.postLikeRepo.save(model);
  }
}

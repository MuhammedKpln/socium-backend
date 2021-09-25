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

  async beforeInsert(event: InsertEvent<PostEntity>) {
    const postLike = new PostLike();
    postLike.likeCount = 0;

    const postLikeSave = await this.postLikeRepo.save(postLike);

    event.entity.postLike = postLikeSave;
  }
}

import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Job, DoneCallback } from 'bull';
import { User } from 'src/auth/entities/user.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Follower } from 'src/follower/entities/follower.entity';
import { PostLike } from 'src/likes/entities/PostLike.entity';
import { UserLike } from 'src/likes/entities/UserLike.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { createConnection, LessThan, MoreThan } from 'typeorm';
import { Messages } from './entities/messages.entity';
import { Room } from './entities/room.entity';

export default async function (job: Job, cb: DoneCallback) {
  let DATABASE_OPTIONS;

  if (process.env.NODE_ENV == 'production') {
    DATABASE_OPTIONS = {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      synchronize: true,
      entities: [
        Messages,
        Room,
        User,
        PostEntity,
        Comment,
        PostLike,
        UserLike,
        Follower,
      ],
    };
  } else {
    DATABASE_OPTIONS = {
      type: 'postgres',
      host: 'localhost',
      database: 'postgres',
      username: 'postgres',
      synchronize: process.env.NODE_ENV !== 'production',
      entities: [
        Messages,
        Room,
        User,
        PostEntity,
        Comment,
        PostLike,
        UserLike,
        Follower,
      ],
    };
  }

  const db = await createConnection(DATABASE_OPTIONS);
  const dateNow = new Date();
  dateNow.setHours(24);

  await db.getRepository(Room).delete({
    id: job.roomId,
  });
}

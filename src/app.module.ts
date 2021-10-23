import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { verify } from 'jsonwebtoken';
import { join } from 'path';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { jwtConstants } from './auth/constans';
import { ChatModule } from './chat/chat.module';
import { CommentModule } from './comment/comment.module';
import { FollowerModule } from './follower/follower.module';
import { LikesModule } from './likes/likes.module';
import { NotificationModule } from './notification/notification.module';
import { PostModule } from './post/post.module';
import { PostService } from './post/post.service';
import { ProfileModule } from './profile/profile.module';
import { PubsubModule } from './pubsub/pubsub.module';
import { StarModule } from './star/star.module';
import { UserModule } from './user/user.module';

let DATABASE_OPTIONS: TypeOrmModuleOptions;

if (process.env.NODE_ENV === 'production') {
  DATABASE_OPTIONS = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    autoLoadEntities: true,
    synchronize: true,
  };
} else {
  DATABASE_OPTIONS = {
    type: 'postgres',
    host: 'localhost',
    database: 'postgres',
    username: 'postgres',
    synchronize: process.env.NODE_ENV !== 'production',
    autoLoadEntities: true,
  };
}

@Module({
  imports: [
    TypeOrmModule.forRoot(DATABASE_OPTIONS),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAILGUN_SMTP_SERVER,
        port: parseInt(process.env.MAILGUN_SMTP_PORT),
        ignoreTLS: true,
        secure: false,
        auth: {
          user: process.env.MAILGUN_SMTP_LOGIN,
          pass: process.env.MAILGUN_SMTP_PASSWORD,
        },
      },
      defaults: {
        from: '"Derdevam" <noreply@derdevam.com>',
        port: 25,
      },
    }),
    GraphQLModule.forRoot({
      playground: true,
      installSubscriptionHandlers: true,
      debug: true,
      autoSchemaFile: true,
      subscriptions: {
        'graphql-ws': {
          path: '/graphql',
          onConnect: async ({ connectionParams }) => {
            const authToken = <string>connectionParams.authToken;
            if (!authToken) {
              throw new Error('FORBIDDEN');
            }

            const verified = verify(authToken, jwtConstants.SECRET_KEY);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            if (verified.email) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              return { user: verified.email };
            } else {
              return {};
            }
          },
        },
      },
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD || '',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        db: 1,
      },
      defaultJobOptions: {
        removeOnFail: true,
        removeOnComplete: true,
        delay: 1000,
        lifo: true,
        attempts: 3,
        timeout: 5000,
      },
    }),
    AuthModule,
    ProfileModule,
    PostModule,
    FollowerModule,
    UserModule,
    CommentModule,
    LikesModule,
    NotificationModule,
    ChatModule,
    StarModule,
    PubsubModule,
  ],
  providers: [AppService, PostService],
})
export class AppModule {}

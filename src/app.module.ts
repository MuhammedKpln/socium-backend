import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { ProfileModule } from './profile/profile.module';
import { PostService } from './post/post.service';
import { PostModule } from './post/post.module';
import { FollowerModule } from './follower/follower.module';
import { UserModule } from './user/user.module';
import { CommentModule } from './comment/comment.module';
import { LikesModule } from './likes/likes.module';
import { NotificationModule } from './notification/notification.module';
import { ChatModule } from './chat/chat.module';
import { StarModule } from './star/star.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BullModule } from '@nestjs/bull';
import { PubsubModule } from './pubsub/pubsub.module';
import { verify, sign, decode } from 'jsonwebtoken';
import { jwtConstants } from './auth/constans';

let DATABASE_OPTIONS: TypeOrmModuleOptions;

if (process.env.NODE_ENV === 'production') {
  DATABASE_OPTIONS = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
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
      transport:
        process.env.SMTP_ADRESS ||
        'smtp://0432c7d1ef71e7:1f0621b32bc577@smtp.mailtrap.io',
      defaults: {
        from: '"Derdevan" <noreply@derdevan.com>',
        port: 25,
      },
    }),
    GraphQLModule.forRoot({
      playground: true,
      installSubscriptionHandlers: true,
      debug: true,
      autoSchemaFile: 'schema.gql',
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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      serveStaticOptions: {
        cacheControl: true,
        maxAge: 604 * 100000,
        index: false,
      },
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD || '',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        db: 1,
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

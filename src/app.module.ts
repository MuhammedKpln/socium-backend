import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { ProfileModule } from './profile/profile.module';
import { PostController } from './post/post.controller';
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

let DATABASE_OPTIONS: TypeOrmModuleOptions;

if (process.env.NODE_ENV == 'production') {
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
      debug: false,
      autoSchemaFile: 'schema.gql',
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
  ],
  controllers: [AppController, PostController],
  providers: [AppService, PostService],
})
export class AppModule {}

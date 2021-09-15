import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat.gateway';
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

let DATABASE_OPTIONS: TypeOrmModuleOptions;

if (process.env.NODE_ENV == 'production') {
  DATABASE_OPTIONS = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    autoLoadEntities: true,
    subscribers: [],
  };
} else {
  DATABASE_OPTIONS = {
    type: 'sqlite',
    database: '/Users/muhammedkpln/Documents/dert/data.db',
    synchronize: process.env.NODE_ENV !== 'production',
    autoLoadEntities: true,
    subscribers: [],
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
    AuthModule,
    ProfileModule,
    PostModule,
    FollowerModule,
    UserModule,
    CommentModule,
    LikesModule,
  ],
  controllers: [AppController, PostController],
  providers: [AppService, ChatGateway, PostService],
})
export class AppModule {}

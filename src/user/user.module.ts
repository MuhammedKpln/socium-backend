import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { UserLike } from 'src/likes/entities/UserLike.entity';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { Star } from 'src/star/entities/star.entity';
import { UserController } from './user.controller';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Star, UserLike]), PubsubModule],
  controllers: [UserController],
  providers: [UserService, UserResolver],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}

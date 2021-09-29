import { NotFoundException, UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { Star } from 'src/star/entities/star.entity';
import { UserService } from './user.service';
import { ApolloError } from 'apollo-server-errors';

@ObjectType()
class CustomUserResponse extends User {
  @Field()
  postsCount: number;
  @Field()
  followersCount: number;
  @Field()
  followingsCount: number;
}

@Resolver((_of) => User)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}

  @Query((_returns) => CustomUserResponse)
  async getUser(@Args('username') username: string) {
    const user = await this.usersService.getUserByUsername(username);

    if (user) {
      return user;
    }

    throw new NotFoundException();
  }

  @Query((_returns) => Star)
  @UseGuards(JwtAuthGuard)
  async getUserStars(@UserDecorator() user: User) {
    const stars = await this.usersService.getUserStars(user.id);

    if (stars) {
      return stars;
    }

    console.log('SEa');
  }

  @Mutation((_returns) => Star)
  @UseGuards(JwtAuthGuard)
  async addNewStar(@UserDecorator() user: User) {
    const stars = await this.usersService.addNewStar(user.id);

    if (stars) {
      return stars;
    }

    throw new ApolloError('Could not add star');
  }

  @Mutation((_returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteStar(@UserDecorator() user: User) {
    const stars = await this.usersService.deleteOneStar(user.id);

    if (stars) {
      return true;
    }

    return false;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApolloError } from 'apollo-server-errors';
import { User } from 'src/auth/entities/user.entity';
import { UserLike } from 'src/likes/entities/UserLike.entity';
import { Star } from 'src/star/entities/star.entity';
import { Repository } from 'typeorm';
import { UpdateUserAgeAndGenderDto } from './dtos/UpdateUserAgeAndGender.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly usersService: Repository<User>,
    @InjectRepository(Star) private readonly starService: Repository<Star>,
    @InjectRepository(UserLike)
    private readonly userLikeService: Repository<UserLike>,
  ) {}

  async getUserByUsername(username: string) {
    const qb = this.usersService.createQueryBuilder('user');
    qb.where('user.username = :username', { username });
    qb.loadRelationCountAndMap('user.postsCount', 'user.posts');
    qb.loadRelationCountAndMap('user.followersCount', 'user.followers');
    qb.loadRelationCountAndMap('user.followingsCount', 'user.following');

    return await qb.getOne();
  }
  async getUserByEmail(email: string) {
    const qb = this.usersService.createQueryBuilder('user');
    qb.where('user.email = :email', { email });
    qb.loadRelationCountAndMap('user.postsCount', 'user.posts');
    qb.loadRelationCountAndMap('user.followersCount', 'user.followers');
    qb.loadRelationCountAndMap('user.followingsCount', 'user.following');

    return await qb.getOne();
  }

  async getUserStars(userId: number): Promise<Star | false> {
    const user = new User();
    user.id = userId;

    const model = await this.starService.findOne({ user });

    if (model) {
      return model;
    }

    return false;
  }

  async addNewStar(userId: number): Promise<Star | false> {
    const user = new User();
    user.id = userId;

    const model = await this.starService.findOne({ user });

    const update = await this.starService.update(
      { user },
      {
        starCount: model.starCount + 1,
      },
    );

    if (update.affected !== 0) {
      return model;
    }

    return false;
  }

  async deleteOneStar(userId: number): Promise<Star | false> {
    const user = new User();
    user.id = userId;

    const model = await this.starService.findOne({ user });

    const update = await this.starService.update(
      { user },
      {
        starCount: model.starCount - 1,
      },
    );

    if (update.affected !== 0) {
      return model;
    }

    return false;
  }

  async updateUserAgeAndGender(data: UpdateUserAgeAndGenderDto, user: User) {
    const update = await this.usersService.save({
      ...user,
      gender: data.gender,
      birthday: data.birthday,
    });

    if (update) {
      return await this.getUserByEmail(user.email);
    }

    throw new ApolloError('Could not update');
  }

  async userLikedPosts(user: User) {
    const posts = await this.userLikeService.find({
      where: {
        user,
      },
      relations: ['post'],
    });

    return posts;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApolloError } from 'apollo-server-errors';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { User } from 'src/auth/entities/user.entity';
import { PaginationParams } from 'src/inputypes/pagination.input';
import { STATUS_CODE } from 'src/status_code';
import { Repository } from 'typeorm';
import { Follower } from './entities/follower.entity';

@Injectable()
export class FollowerService {
  constructor(
    @InjectRepository(Follower)
    private readonly followersService: Repository<Follower>,
    @InjectRepository(User)
    private readonly usersService: Repository<User>,
  ) {}

  async getFollowersById(userId: number, options: PaginationParams) {
    const qb = this.followersService
      .createQueryBuilder('follower')
      .where('follower.actorId = :id', { id: userId })
      .leftJoinAndSelect('follower.user', 'user')
      .leftJoinAndSelect('follower.actor', 'actor')
      .offset(options.offset)
      .limit(options.limit);

    return qb.getMany();
  }
  async getFollowingsById(userId: number, options: PaginationParams) {
    const qb = this.followersService
      .createQueryBuilder('follower')
      .where('follower.userId = :id', { id: userId })
      .leftJoinAndSelect('follower.user', 'user')
      .leftJoinAndSelect('follower.actor', 'actor')
      .offset(options.offset)
      .limit(options.limit);

    return qb.getMany();
  }

  async isUserFollowingActor(userId: number, actorId: number) {
    const user = await this.usersService.findOne({ id: userId });

    const actor = await this.usersService.findOne({ id: actorId });

    return await this.followersService.findOne({
      user,
      actor,
    });
  }

  async followUser(user: User, actorId: number): Promise<boolean> {
    const actor = await this.usersService.findOne({ id: actorId });
    const alreadyFollowing = await this.checkIfUserFollowsActor(user, actorId);

    if (!actor) {
      return false;
    }

    if (user.id === actor.id) {
      return false;
    }

    if (!alreadyFollowing) {
      const model = await this.followersService.create({
        user,
        actor,
      });

      await this.followersService.save(model);

      return true;
    } else {
      throw new ApolloError('ALREADY_FOLLOWING', 'ALREADY_FOLLOWING', {
        error_code: STATUS_CODE.ALREADY_FOLLOWING_USER,
      });
    }
  }
  async unFollowUser(user: User, actorId: number): Promise<boolean> {
    const actor = await this.usersService.findOne(actorId);
    const alreadyFollowing = await this.checkIfUserFollowsActor(user, actorId);

    if (alreadyFollowing) {
      this.followersService.delete({
        user,
        actor,
      });
      return true;
    }

    return false;
  }

  private async checkIfUserFollowsActor(user: User, actorId: number) {
    const actor = await this.usersService.findOne(actorId);

    if (actor) {
      const exists = await this.followersService.findOne({
        user,
        actor,
      });

      if (exists) {
        return true;
      }

      return false;
    }

    return false;
  }
}

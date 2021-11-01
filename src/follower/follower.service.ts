import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { PaginationParams } from 'src/inputypes/pagination.input';
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

  async followUser(user: User, actorId: number): Promise<Follower | false> {
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

      return await this.followersService.save(model);
    } else {
      return false;
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

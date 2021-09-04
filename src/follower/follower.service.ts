import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
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

  async followUser(user: User, actorId: number): Promise<boolean> {
    const actor = await this.usersService.findOne(actorId);
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
    }

    return false;
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

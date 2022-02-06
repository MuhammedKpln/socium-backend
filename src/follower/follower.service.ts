import { Injectable } from '@nestjs/common';
import { Follower } from '@prisma/client';
import * as shuffleArray from 'lodash.shuffle';
import { User } from 'src/auth/entities/user.entity';
import { PaginationParams } from 'src/inputypes/pagination.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { P, PBool } from 'src/types';

@Injectable()
export class FollowerService {
  constructor(private readonly prisma: PrismaService) {}

  async getFollowersById(
    userId: number,
    options: PaginationParams,
  ): P<Follower[]> {
    const followers = await this.prisma.follower.findMany({
      where: {
        actorId: userId,
      },
      include: {
        actor: true,
        user: true,
      },
      take: options.limit,
      skip: options.offset,
    });

    return followers;
  }
  async getFollowingsById(userId: number, options: PaginationParams) {
    const followers = await this.prisma.follower.findMany({
      where: {
        userId,
      },
      include: {
        actor: true,
        user: true,
      },
      take: options.limit,
      skip: options.offset,
    });

    return followers;
  }

  async isUserFollowingActor(userId: number, actorId: number): PBool {
    const model = await this.prisma.follower.findFirst({
      where: {
        userId,
        actorId,
      },
    });

    if (model) {
      return true;
    }

    return false;
  }

  async followUser(user: User, actorId: number): Promise<Follower | false> {
    const alreadyFollowing = await this.checkIfUserFollowsActor(user, actorId);

    if (user.id === actorId) {
      return false;
    }

    if (!alreadyFollowing) {
      const model = await this.prisma.follower.create({
        data: {
          userId: user.id,
          actorId,
        },
        include: {
          actor: true,
          user: true,
        },
      });

      return model;
    } else {
      return alreadyFollowing;
    }
  }
  async unFollowUser(user: User, actorId: number): PBool {
    const alreadyFollowing = await this.checkIfUserFollowsActor(user, actorId);

    if (alreadyFollowing) {
      await this.prisma.follower.delete({
        where: {
          id: alreadyFollowing.id,
        },
      });

      return true;
    }

    return false;
  }

  private async checkIfUserFollowsActor(
    user: User,
    actorId: number,
  ): P<Follower | false> {
    const exists = await this.prisma.follower.findFirst({
      where: {
        userId: user.id,
        actorId,
      },
    });

    if (exists) {
      return exists;
    }

    return false;
  }

  async shouldFollowThoseUsers(user?: User) {
    if (user) {
      const users = await this.prisma.user.findMany({
        take: 10,
        where: {
          followers: {
            none: {
              userId: user.id,
            },
          },
          AND: {
            NOT: {
              id: user.id,
            },
          },
        },
      });

      return shuffleArray(users);
    }

    const users = await this.prisma.user.findMany({
      take: 10,
    });

    return shuffleArray(users);
  }
}

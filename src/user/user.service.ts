import { Injectable } from '@nestjs/common';
import { Star } from '@prisma/client';
import { ApolloError } from 'apollo-server-errors';
import { User } from 'src/auth/entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserAgeAndGenderDto } from './dtos/UpdateUserAgeAndGender.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        userAvatarMeta: {
          select: {
            avatar: true,
          },
        },
        _count: {
          select: {
            posts: true,
            followers: true,
            followings: true,
          },
        },
      },
    });
  }
  async getUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        userAvatarMeta: {
          select: {
            avatar: true,
          },
        },
        _count: {
          select: {
            posts: true,
            followers: true,
            followings: true,
          },
        },
      },
    });
  }

  async getUserStars(userId: number): Promise<Star | false> {
    const model = await this.prisma.star.findUnique({
      where: {
        userId,
      },
    });

    if (model) {
      return model;
    }

    return false;
  }

  async addNewStar(userId: number): Promise<Star | false> {
    const user = new User();
    user.id = userId;

    const model = await this.getUserStars(userId);

    if (model) {
      const update = await this.prisma.star.update({
        where: { userId },
        data: {
          starCount: model.starCount + 1,
        },
      });

      if (update) {
        return model;
      }
    }

    return false;
  }

  async deleteOneStar(userId: number): Promise<Star | false> {
    const user = new User();
    user.id = userId;

    const model = await this.getUserStars(userId);

    if (model) {
      const update = await this.prisma.star.update({
        where: { userId },
        data: {
          starCount: model.starCount - 1,
        },
      });

      if (update) {
        return model;
      }
    }

    return false;
  }

  async updateUserAgeAndGender(data: UpdateUserAgeAndGenderDto, user: User) {
    const update = await this.prisma.user.update({
      where: {
        username: user.username,
      },
      data: {
        gender: data.gender,
        birthday: data.birthday,
      },
    });

    if (update) {
      return update;
    }

    throw new ApolloError('Could not update');
  }

  async userLikedPosts(user: User) {
    const userPosts = await this.prisma.user.findUnique({
      where: {
        username: user.username,
      },
      include: {
        posts: {
          include: {
            postLike: true,
            userLike: true,
            user: true,
            _count: {
              select: {
                comment: true,
              },
            },
          },
        },
      },
    });

    return userPosts.posts;
  }
}

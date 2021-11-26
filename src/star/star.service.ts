import { Injectable } from '@nestjs/common';
import { Star } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { P } from 'src/types';

@Injectable()
export class StarService {
  constructor(private readonly prisma: PrismaService) {}

  public async create(userId: number): P<Star> {
    return await this.prisma.star.create({
      data: {
        userId,
      },
    });
  }

  async userStars(userId: number): P<Star | false> {
    const result = await this.prisma.star.findUnique({
      where: {
        userId,
      },
    });

    if (result) {
      return result;
    }

    return false;
  }

  async decreaseStar(userId: number): P<boolean> {
    const star = await this.userStars(userId);

    if (star) {
      const update = await this.prisma.star.update({
        where: { userId },
        data: {
          starCount: star.starCount - 1,
        },
      });

      if (update) {
        return true;
      }
    }

    return false;
  }

  async increaseStar(userId: number): P<boolean> {
    const star = await this.userStars(userId);

    if (star) {
      const update = await this.prisma.star.update({
        where: { userId },
        data: {
          starCount: star.starCount + 1,
        },
      });

      if (update) {
        return true;
      }
    }

    return false;
  }
}

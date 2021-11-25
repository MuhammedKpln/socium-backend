import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StarService {
  constructor(private readonly prisma: PrismaService) {}

  public async create(userId: number) {
    return await this.prisma.star.create({
      data: {
        userId,
      },
    });
  }
}

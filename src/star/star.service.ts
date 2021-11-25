import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { Repository } from 'typeorm';
import { Star } from './entities/star.entity';

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

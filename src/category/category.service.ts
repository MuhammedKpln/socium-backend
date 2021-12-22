import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async listAllCategories() {
    return await this.prisma.category.findMany();
  }

  async getOneById(id: number) {
    return await this.prisma.category.findUnique({
      where: {
        id,
      },
    });
  }
}

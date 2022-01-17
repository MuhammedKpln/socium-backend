import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { classToPlain } from 'class-transformer';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditProfileDto } from './dtos/edit-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async editProfile(
    userId: number,
    updates: EditProfileDto,
  ): Promise<User | false> {
    const plainUpdates = classToPlain(updates);

    const update = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: plainUpdates,
    });

    if (update) {
      return update;
    }

    return false;
  }
}

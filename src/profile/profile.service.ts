import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { classToPlain } from 'class-transformer';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { EditProfileDto } from './dtos/edit-profile.dto';

@Injectable()
export class ProfileService {
  constructor(@InjectRepository(User) private usersService: Repository<User>) {}

  async editProfile(
    userId: number,
    updates: EditProfileDto,
  ): Promise<User | false> {
    const plainUpdates = classToPlain(updates);
    const model = await this.usersService.create({
      id: userId,
      ...plainUpdates,
    });

    const update = await this.usersService.save(model);

    update.emoji = `emoji/` + update.emoji;

    if (update) {
      return update;
    }

    return false;
  }
}

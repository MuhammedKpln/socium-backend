import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { classToPlain } from 'class-transformer';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { EditProfileDto } from './dtos/edit-profile.dto';

@Injectable()
export class ProfileService {
  constructor(@InjectRepository(User) private usersService: Repository<User>) {}

  async editProfile(userId: number, updates: EditProfileDto): Promise<boolean> {
    const plainUpdates = classToPlain(updates);
    const update = await this.usersService.update({ id: userId }, plainUpdates);

    if (update.affected !== 0) {
      return true;
    }

    return false;
  }
}

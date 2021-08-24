import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/auth/decorators/user.decorator';
import { User as UserEntity } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { EditProfileDto } from './dtos/edit-profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Post('edit-profile')
  async editProfile(@User() user: UserEntity, @Body() profile: EditProfileDto) {
    const updateProfile = await this.profileService.editProfile(
      user.id,
      profile,
    );

    if (updateProfile) {
      return user;
    }

    throw new HttpException(
      {
        status: false,
      },
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}

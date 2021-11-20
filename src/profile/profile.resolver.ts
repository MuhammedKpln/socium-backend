import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-errors';
import { User } from 'src/auth/decorators/user.decorator';
import { User as UserEntity } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ImageUploader } from 'src/helpers/imageUploader';
import { UserService } from 'src/user/user.service';
import { EditProfileDto } from './dtos/edit-profile.dto';
import { ProfileService } from './profile.service';

@Resolver((_of) => User)
@UseGuards(JwtAuthGuard)
export class ProfileResolver {
  constructor(
    private profileService: ProfileService,
    private userService: UserService,
  ) {}

  @Mutation((_returns) => UserEntity)
  async editProfile(
    @User() user: UserEntity,
    @Args('profile') profile: EditProfileDto,
  ) {
    if (profile?.avatar) {
      const imageHelper = new ImageUploader(profile.avatar);
      //Remove previous avatar
      await imageHelper.removeFile(user.avatar);
      const { randomFileName } = await imageHelper.decodeImage().createFile();

      profile.avatar = randomFileName;
    }

    const updateProfile = await this.profileService.editProfile(
      user.id,
      profile,
    );

    if (updateProfile) {
      const userEntity = await this.userService.getUserByEmail(user.email);
      return userEntity;
    }

    throw new UserInputError('Could not update profile');
  }
}

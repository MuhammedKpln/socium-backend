import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-errors';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
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

  @Mutation((_returns) => User)
  async editProfile(
    @UserDecorator() user: User,
    @Args('profile') profile: EditProfileDto,
  ) {
    if (profile?.avatar) {
      const imageHelper = new ImageUploader(profile.avatar);
      //Remove previous avatar
      await imageHelper.removeFile(user.avatar);
      const { randomFileName } = await imageHelper.decodeImage().createFile();

      profile.avatar = randomFileName;
    }

    if (profile?.avatarMeta) {
      await this.profileService.updateAvatarMeta(user.id, profile.avatarMeta);
      profile.avatarMeta = undefined;
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

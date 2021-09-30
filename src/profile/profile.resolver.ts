import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ProfileService } from './profile.service';
import { User } from 'src/auth/decorators/user.decorator';
import { User as UserEntity } from 'src/auth/entities/user.entity';
import { EditProfileDto } from './dtos/edit-profile.dto';
import { UserInputError } from 'apollo-server-errors';

@Resolver((_of) => User)
export class ProfileResolver {
  constructor(private profileService: ProfileService) {}

  @Mutation((_returns) => UserEntity)
  async editProfile(
    @User() user: UserEntity,
    @Args('profile') profile: EditProfileDto,
  ) {
    const updateProfile = await this.profileService.editProfile(
      user.id,
      profile,
    );

    if (updateProfile) {
      return user;
    }

    throw new UserInputError('Could not update profile');
  }
}

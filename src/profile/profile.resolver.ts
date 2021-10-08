import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ProfileService } from './profile.service';
import { User } from 'src/auth/decorators/user.decorator';
import { User as UserEntity } from 'src/auth/entities/user.entity';
import { EditProfileDto } from './dtos/edit-profile.dto';
import { UserInputError } from 'apollo-server-errors';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { Inject, UseGuards } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PUB_SUB } from 'src/pubsub/pubsub.module';
import { PubSub } from 'graphql-subscriptions';
import { PROFILE_UPDATED_EVENT } from 'src/profile/events.pubsub';

@Resolver((_of) => User)
@UseGuards(JwtAuthGuard)
export class ProfileResolver {
  constructor(
    private profileService: ProfileService,
    private userService: UserService,
    @Inject(PUB_SUB) private pubSub: PubSub,
  ) {}

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
      const userEntity = await this.userService.getUserByEmail(user.email);
      this.pubSub.publish(PROFILE_UPDATED_EVENT, {
        profileUpdated: userEntity,
      });
      return await userEntity;
    }

    throw new UserInputError('Could not update profile');
  }
}

import { InjectQueue } from '@nestjs/bull';
import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-errors';
import { Queue } from 'bull';
import { PubSub } from 'graphql-subscriptions';
import { User } from 'src/auth/decorators/user.decorator';
import { User as UserEntity } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ImageUploader } from 'src/helpers/imageUploader';
import { PUB_SUB } from 'src/pubsub/pubsub.module';
import { QueueEvents, Queues } from 'src/types';
import { UserService } from 'src/user/user.service';
import { IMinifyAvatarJob } from './consumers/MinifyAvatar.consumer';
import { EditProfileDto } from './dtos/edit-profile.dto';
import { ProfileService } from './profile.service';

@Resolver((_of) => User)
@UseGuards(JwtAuthGuard)
export class ProfileResolver {
  constructor(
    private profileService: ProfileService,
    private userService: UserService,
    @InjectQueue(Queues.MinifyAvatar)
    private minifyJob: Queue<IMinifyAvatarJob>,
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
      const { file, randomFileName } = await imageHelper
        .decodeImage()
        .createFile();

      this.minifyJob.add(QueueEvents.MinifyAvatar, {
        path: file,
        avatarPath: 'avatars/' + randomFileName + '.svg',
      });
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

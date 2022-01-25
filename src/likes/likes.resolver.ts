import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-errors';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ERROR_CODES } from 'src/error_code';
import { CreateUserLikeDto } from './dtos/CreateUserLike.dto';
import { PostLike } from './entities/PostLike.entity';
import { UserLike } from './entities/UserLike.entity';
import { LikesService } from './likes.service';

@Resolver()
@UseGuards(JwtAuthGuard)
export class LikesResolver {
  constructor(private readonly likesService: LikesService) {}

  @Mutation((_returns) => PostLike)
  async likeEntry(
    @UserDecorator() user: User,
    @Args('data') data: CreateUserLikeDto,
  ) {
    if (data.comment) {
      const likeComment = await this.likesService.likeComment(
        user,
        data.comment,
      );

      if (likeComment) {
        return likeComment;
      }
    }

    if (data.post) {
      const likePost = await this.likesService.likePost(user, data.post);

      if (likePost) {
        return likePost;
      }
    }

    throw new UserInputError('Already liked', {
      error_code: ERROR_CODES.ALREADY_LIKED,
    });
  }

  @Mutation((_returns) => PostLike)
  async unlikeEntry(
    @UserDecorator() user: User,
    @Args('data') data: CreateUserLikeDto,
  ) {
    if (data.comment) {
      return await this.likesService.unlikeComment(data.comment, user);
    }

    if (data.post) {
      return await this.likesService.unlikePost(data.post, user);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { User } from 'src/auth/entities/user.entity';
import { PaginationParams } from 'src/inputypes/pagination.input';
import { PostEntity } from 'src/post/entities/post.entity';
import { Repository } from 'typeorm';
import { CreteNewCommentDto } from './dtos/CreateNewComment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsService: Repository<Comment>,
    @InjectRepository(PostEntity)
    private readonly postService: Repository<PostEntity>,
  ) {}

  async _getPostComments(postId: number, option: PaginationParams) {
    const post = await this.postService.findOne(postId);

    return await this.commentsService.find({
      skip: option.offset,
      take: option.limit,
      where: {
        post,
      },
    });
  }

  async getPostComments(postId: number, options: IPaginationOptions) {
    const post = await this.postService.findOne(postId);

    const queryBuilder = this.commentsService.createQueryBuilder('comments');
    queryBuilder.where('comments.post = :postId', { postId: post.id });
    queryBuilder.leftJoinAndSelect('comments.post', 'post');
    queryBuilder.leftJoinAndSelect('comments.user', 'user');

    return paginate(queryBuilder, options);
  }

  async createEntity(postId: number, entity: CreteNewCommentDto, user: User) {
    const post = await this.postService.findOne(postId);

    const model = await this.commentsService.create({
      ...entity,
      post,
      user,
    });

    return await this.commentsService.save(model);
  }
}

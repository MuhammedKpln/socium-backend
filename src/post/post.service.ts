import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dtos/createPost';
import { PostEntity } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsService: Repository<PostEntity>,
    @InjectRepository(User) private readonly usersService: Repository<User>,
  ) {}

  async paginate(options: IPaginationOptions): Promise<Pagination<PostEntity>> {
    const qb = this.postsService.createQueryBuilder('post');
    qb.leftJoinAndSelect('post.userLike', 'userLike');
    qb.leftJoinAndSelect('post.postLike', 'postLike');
    qb.leftJoinAndSelect('post.user', 'user');
    qb.loadRelationCountAndMap('post.commentsCount', 'post.comments');

    return paginate(qb, options);
  }

  async getByUsername(username: string, options: IPaginationOptions) {
    const user = await this.usersService.findOne({
      username,
    });
    if (user) {
      const queryBuilder = this.postsService.createQueryBuilder('post');
      queryBuilder.where('post.userId = :userId', { userId: user.id });
      queryBuilder.leftJoinAndSelect('post.userLike', 'userLike');
      queryBuilder.leftJoinAndSelect('post.postLike', 'postLike');
      queryBuilder.leftJoinAndSelect('post.user', 'user');
      queryBuilder.loadRelationCountAndMap(
        'post.commentsCount',
        'post.comments',
      );

      return paginate(queryBuilder, options);
    }
  }

  async getPost(slug: string) {
    const post = await this.postsService.findOne({
      slug,
    });

    if (post) {
      return post;
    }
  }

  async createPost(post: CreatePostDto, user: User) {
    const postModel: PostEntity = {
      ...post,
      user: user,
    };

    const model = this.postsService.create(postModel);
    return this.postsService.save(model);
  }
}

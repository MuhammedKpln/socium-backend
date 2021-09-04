import { Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dtos/createPost';
import { PostEntity } from './entities/post.entity';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsService: Repository<PostEntity>,
    @InjectRepository(User) private readonly usersService: Repository<User>,
  ) {}

  async paginate(options: IPaginationOptions): Promise<Pagination<PostEntity>> {
    return paginate<PostEntity>(this.postsService, options);
  }

  async getByUsername(username: string, options: IPaginationOptions) {
    const user = await this.usersService.findOne({
      username,
    });
    if (user) {
      const queryBuilder = this.postsService.createQueryBuilder('post');
      queryBuilder.where('post.userId = :userId', { userId: user.id });

      return paginate(queryBuilder, options);
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

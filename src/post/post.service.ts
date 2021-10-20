import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  async getAllPosts(): Promise<PostEntity[]> {
    const queryBuilder = this.postsService.createQueryBuilder('post');
    queryBuilder.leftJoinAndSelect('post.userLike', 'userLike');
    queryBuilder.leftJoinAndSelect('post.postLike', 'postLike');
    queryBuilder.leftJoinAndSelect('post.user', 'user');
    queryBuilder.loadRelationCountAndMap('post.commentsCount', 'post.comments');
    queryBuilder.limit(10);

    return await queryBuilder.getMany();
  }

  async getAllPostsFromUser(username: string) {
    const user = await this.usersService.findOne({
      username,
    });

    const queryBuilder = this.postsService.createQueryBuilder('post');
    queryBuilder.where('post.userId = :userId', { userId: user.id });
    queryBuilder.leftJoinAndSelect('post.userLike', 'userLike');
    queryBuilder.leftJoinAndSelect('post.postLike', 'postLike');
    queryBuilder.leftJoinAndSelect('post.user', 'user');
    queryBuilder.loadRelationCountAndMap('post.commentsCount', 'post.comments');

    return await queryBuilder.getMany();
  }

  async getUserLikedPosts(userId: number) {
    const queryBuilder = this.postsService.createQueryBuilder('post');
    queryBuilder.where('post.userId = :userId', { userId });
    queryBuilder.leftJoinAndSelect('post.userLike', 'userLike');
    queryBuilder.leftJoinAndSelect('post.postLike', 'postLike');
    queryBuilder.leftJoinAndSelect('post.user', 'user');
    queryBuilder.loadRelationCountAndMap('post.commentsCount', 'post.comments');

    return await queryBuilder.getMany();
  }

  private async getOneBySlug(slug: string) {
    const post = await this.postsService.findOne({
      slug,
    });
    if (post) {
      const queryBuilder = this.postsService
        .createQueryBuilder('post')
        .where('post.slug = :slug', { slug })
        .leftJoinAndSelect('post.userLike', 'userLike')
        .leftJoinAndSelect('post.postLike', 'postLike')
        .leftJoinAndSelect('post.user', 'user')
        .loadRelationCountAndMap('post.commentsCount', 'post.comments');

      return await queryBuilder.getOne();
    }
  }

  async getPost(slug: string) {
    const post = await this.getOneBySlug(slug);

    if (post) {
      return post;
    }

    return false;
  }

  async createPost(post: CreatePostDto, user: User) {
    const postModel: PostEntity = {
      ...post,
      user,
    };

    const model = await this.postsService.create(postModel);
    const save = await this.postsService.save(model);
    return await this.getOneBySlug(save.slug);
  }
}

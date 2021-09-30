import { Injectable, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { Repository } from 'typeorm';
import { UserLike } from './entities/UserLike.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(UserLike) private repo: Repository<UserLike>,
    @InjectRepository(PostEntity) private postRepo: Repository<PostEntity>,
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
  ) {}

  async likePost(user: User, postId: number) {
    const post = await this.postRepo.findOne({ id: postId });

    const like = await this.repo.create({
      post,
      liked: true,
      user,
    });

    try {
      return await this.repo.save(like);
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async unlikePost(postId: number, user: User) {
    const post = new PostEntity();
    post.id = postId;

    const userLike = await this.repo.findOne(
      { post, user },
      { relations: ['post'] },
    );

    if (!userLike) {
      return false;
    }

    const deleted = await this.repo.remove(userLike);

    if (deleted) {
      return true;
    }

    return false;
  }
  async likeComment(user: User, commentId: number) {
    const comment = await this.commentRepo.findOne({ id: commentId });

    const like = await this.repo.create({
      comment,
      liked: true,
      user,
    });

    try {
      return await this.repo.save(like);
    } catch (error) {
      return false;
    }
  }

  async unlikeComment(commentId: number, user: User) {
    const comment = new Comment();
    comment.id = commentId;

    const userLike = await this.repo.findOne(
      { comment, user },
      { relations: ['comment'] },
    );

    if (!userLike) {
      return false;
    }

    const deleted = await this.repo.remove(userLike);

    if (deleted) {
      return true;
    }

    return false;
  }
}

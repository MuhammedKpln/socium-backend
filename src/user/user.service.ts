import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly usersService: Repository<User>,
  ) {}

  async getUserByUsername(username: string) {
    const qb = this.usersService.createQueryBuilder('user');
    qb.where('user.username = :username', { username });
    qb.loadRelationCountAndMap('user.postsCount', 'user.posts');
    qb.loadRelationCountAndMap('user.followersCount', 'user.followers');
    qb.loadRelationCountAndMap('user.followingsCount', 'user.following');

    return qb.getOne();
  }
}

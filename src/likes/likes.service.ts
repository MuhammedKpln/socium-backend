import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { UserLike } from './entities/UserLike.entity';

@Injectable()
export class LikesService extends TypeOrmCrudService<UserLike> {
  constructor(@InjectRepository(UserLike) public repo: Repository<UserLike>) {
    super(repo);
  }

  asyncTest() {
    const queryBuilder = this.repo.createQueryBuilder('postlike');
    queryBuilder.leftJoinAndSelect('postlike.postLike', 'postLike');

    return queryBuilder.getMany();
  }
}

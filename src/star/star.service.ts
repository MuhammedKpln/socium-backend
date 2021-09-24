import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { Star } from './entities/star.entity';

@Injectable()
export class StarService {
  constructor(@InjectRepository(Star) private starRepo: Repository<Star>) {}

  public async create(userId: number) {
    const user = new User();
    user.id = userId;

    const model = new Star();
    model.user = user;

    return await this.starRepo.save(model);
  }
}

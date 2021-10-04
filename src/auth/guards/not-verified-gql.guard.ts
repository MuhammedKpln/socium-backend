import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { compareHash, compareMD5 } from 'src/cryptHelper';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

interface IContextArgs {
  email: string;
  verificationCode: string;
}

@Injectable()
export class NotVerifiedGraphqlGuard implements CanActivate {
  constructor(@InjectRepository(User) private userService: Repository<User>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { data }: { data: IContextArgs } = ctx.getArgs();
    const { email } = data;
    const user = await this.userService.findOne({
      email,
    });

    if (user) {
      const { isEmailConfirmed } = user;

      if (isEmailConfirmed) {
        return false;
      }

      return true;
    }

    return false;
  }
}

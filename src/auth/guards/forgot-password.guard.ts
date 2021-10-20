import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

interface IContextArgs {
  email: string;
  password: string;
  forgotPasswordCode: number;
}

@Injectable()
export class ForgotPasswordGuard implements CanActivate {
  constructor(@InjectRepository(User) private userService: Repository<User>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { data }: { data: IContextArgs } = ctx.getArgs();
    const { forgotPasswordCode, password, email } = data;

    const user = await this.userService.findOne({
      email,
    });

    if (user && user.forgotPasswordCode !== null) {
      if (forgotPasswordCode !== user.forgotPasswordCode) {
        return false;
      }

      return true;
    }

    return false;
  }
}

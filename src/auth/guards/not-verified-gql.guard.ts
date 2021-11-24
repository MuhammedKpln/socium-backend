import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../auth.service';

interface IContextArgs {
  email: string;
  verificationCode: string;
}

@Injectable()
export class NotVerifiedGraphqlGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { data }: { data: IContextArgs } = ctx.getArgs();
    const { email } = data;
    const user = await this.authService.findOneWithEmail(email);

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

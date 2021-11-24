import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../auth.service';

interface IContextArgs {
  email: string;
  password: string;
  forgotPasswordCode: number;
}

@Injectable()
export class ForgotPasswordGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { data }: { data: IContextArgs } = ctx.getArgs();
    const { forgotPasswordCode, password, email } = data;

    const user = await this.authService.findOneWithEmail(email);

    if (user && user.forgotPasswordCode !== null) {
      if (forgotPasswordCode !== user.forgotPasswordCode) {
        return false;
      }

      return true;
    }

    return false;
  }
}

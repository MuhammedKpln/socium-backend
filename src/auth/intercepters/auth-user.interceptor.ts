import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const type = context.getType();

    if (type === 'http') {
      return next.handle();
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    if (!request) {
      return next.handle();
    }

    const userToken = request.headers.authorization;

    if (!userToken) {
      return next.handle();
    }
    const token = userToken.split(' ');

    const decoded = await this.jwtService.verifyAsync(token[1]);
    const user = await this.authService.findOneWithEmail(decoded['email']);
    request.user = user;

    return next.handle();
  }
}

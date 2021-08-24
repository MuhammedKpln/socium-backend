import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const usertoken = request.headers.authorization;
    const token = usertoken.split(' ');

    const decoded = await this.jwtService.verifyAsync(token[1]);
    const user = await this.authService.findOne(decoded['username']);
    request.user = user;

    return next.handle();
  }
}

import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { ApolloError } from 'apollo-server-fastify';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  handleRequest(err: any, user: any, info: any, context: any, status?: any) {
    if (info instanceof TokenExpiredError) {
      throw new ApolloError('JWT_EXPIRED');
    }

    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { jwtConstants } from './constans';
import { User } from './entities/user.entity';
import { JwtStrategy } from './providers/jwt.strategy';
import { AuthController } from './auth.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SerializeOutput } from './intercepters/output.interceptor';
import { AuthUserInterceptor } from './auth-user.interceptor';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_INTERCEPTOR,
      useClass: SerializeOutput,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthUserInterceptor,
    },
    UserService,
  ],
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.SECRET_KEY,
      signOptions: { expiresIn: '7 days' },
    }),
    UserModule,
  ],
  exports: [TypeOrmModule, JwtModule, UserService],
  controllers: [AuthController],
})
export class AuthModule {}

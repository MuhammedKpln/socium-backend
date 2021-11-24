import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/prisma/prisma.module';
import { Queues } from 'src/types';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { jwtConstants } from './constans';
import { AuthUserInterceptor } from './intercepters/auth-user.interceptor';
import { EmailVerificationConsumer } from './providers/EmailVerification.consumer';
import { ForgotPasswordConsumer } from './providers/ForgotPassword.consumer';
import { JwtStrategy } from './providers/jwt.strategy';

@Module({
  providers: [
    AuthService,
    JwtStrategy,

    {
      provide: APP_INTERCEPTOR,
      useClass: AuthUserInterceptor,
    },
    EmailVerificationConsumer,
    AuthResolver,
    ForgotPasswordConsumer,
  ],
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.SECRET_KEY,
      signOptions: { expiresIn: '7 days' },
    }),
    BullModule.registerQueue(
      {
        name: 'sendVerificationMail',
      },
      {
        name: Queues.ForgotPassword,
      },
    ),
  ],
  exports: [JwtModule, BullModule, AuthService],
})
export class AuthModule {}

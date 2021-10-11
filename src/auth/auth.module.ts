import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StarModule } from 'src/star/star.module';
import { StarService } from 'src/star/star.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthUserInterceptor } from './auth-user.interceptor';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { jwtConstants } from './constans';
import { User } from './entities/user.entity';
import { EmailVerificationConsumer } from './providers/EmailVerification.consumer';
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
    UserService,
    StarService,
    AuthResolver,
  ],
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.SECRET_KEY,
      signOptions: { expiresIn: '7 days' },
    }),
    BullModule.registerQueue({
      name: 'sendVerificationMail',
    }),
    UserModule,
    StarModule,
  ],
  exports: [TypeOrmModule, JwtModule, UserService, StarService, BullModule],
})
export class AuthModule {}

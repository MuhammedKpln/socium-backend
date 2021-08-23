import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { jwtConstants } from './constans';
import { User } from './entities/user.entity';
import { JwtStrategy } from './providers/jwt.strategy';
import { AuthController } from './auth.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SerializeOutput } from './intercepters/output.interceptor';

@Module({
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_INTERCEPTOR,
      useClass: SerializeOutput,
    },
  ],
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.SECRET_KEY,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  exports: [TypeOrmModule, JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}

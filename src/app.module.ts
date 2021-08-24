import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: '/Users/muhammedkpln/Documents/dert/data.db',
      synchronize: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true,
    }),
    MailerModule.forRoot({
      transport:
        process.env.SMTP_ADRESS ||
        'smtp://0432c7d1ef71e7:1f0621b32bc577@smtp.mailtrap.io',
      defaults: {
        from: '"Derdevan" <noreply@derdevan.com>',
        port: 25,
      },
    }),
    AuthModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}

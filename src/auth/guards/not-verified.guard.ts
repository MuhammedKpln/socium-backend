import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compareMD5 } from 'src/cryptHelper';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class NotVerifiedGuard implements CanActivate {
  constructor(@InjectRepository(User) private userService: Repository<User>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;
    const { email, confirmationCode } = params;

    const user = await this.userService.findOne({
      email,
    });

    if (user) {
      const { emailConfirmationCode, isEmailConfirmed } = user;

      if (isEmailConfirmed) {
        return false;
      }

      const compareConfirmtionCode = await compareMD5(
        emailConfirmationCode.toString(),
        confirmationCode,
      );

      if (!compareConfirmtionCode) {
        return false;
      }

      return true;
    }

    return false;
  }
}

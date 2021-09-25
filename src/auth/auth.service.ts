import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compareHash, hashWithMD5 } from 'src/cryptHelper';
import { ERROR_CODES } from 'src/error_code';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import { CreateUserGoogleDto } from './dtos/createUserGoogle.dto';
import { LoginUserDto } from './dtos/loginUser.dto';
import { LoginUserGoogleDto } from './dtos/loginUserGoogle.dto';
import { User } from './entities/user.entity';
import { StarService } from 'src/star/star.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private user: UserService,
    @InjectRepository(User) private usersService: Repository<User>,
    private mailerService: MailerService,
    private starRepo: StarService,
  ) {}

  async findOne(username: string) {
    return await this.usersService.findOneOrFail({
      username,
    });
  }
  async findOneWithEmail(email: string) {
    return await this.usersService.findOne({
      email,
    });
  }

  async validateUser(username: string, password: string): Promise<boolean> {
    const user = await this.usersService.findOne({
      username,
    });

    if (user) {
      const compare = await compareHash(password, user.password);
      if (compare) {
        return true;
      }

      return false;
    }
    return false;
  }

  async login(user: LoginUserDto) {
    const payload = { username: user.username };
    const userDb = await this.user.getUserByUsername(user.username);

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: userDb,
    };
  }
  async loginGoogle(user: LoginUserGoogleDto) {
    const userDb = await this.user.getUserByEmail(user.email);
    const payload = { username: userDb.username };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: userDb,
    };
  }

  async register(user: CreateUserDto): Promise<User> {
    const create = this.usersService.create(user);
    return this.usersService
      .save(create)
      .then(async (resp) => {
        const hashedConfirmationCode = await hashWithMD5(
          resp.emailConfirmationCode.toString(),
        );
        await this.mailerService.sendMail({
          to: resp.email,
          subject: 'Email Dogrulama',
          text: `Email dogrulama kodunuz: /auth/confirm/${resp.email}/${hashedConfirmationCode}`,
        });

        await this.starRepo.create(resp.id);

        return resp;
      })
      .catch((err) => {
        console.log(err);
        throw new HttpException(
          {
            status: false,
            error_code: ERROR_CODES.USER_IS_ALREADY_REGISTERED,
          },
          HttpStatus.NOT_ACCEPTABLE,
        );
      });
  }
  async registerGoogle(user: CreateUserGoogleDto) {
    const create = await this.usersService.create({
      username: user.username,
      email: user.email,
      password: user.idToken,
      isEmailConfirmed: true,
    });

    const model = await this.usersService.save(create);
    await this.starRepo.create(model.id);
    return {
      access_token: await this.jwtService.signAsync({
        username: user.username,
      }),
      user: model,
    };
  }

  async verifyEmail(email: string): Promise<User> {
    const user = await this.usersService.findOne({
      email,
    });

    if (user) {
      const update = await this.usersService.save({
        ...user,
        isEmailConfirmed: true,
        emailConfirmationCode: null,
      });

      if (update) {
        return update;
      }
    }
  }
}

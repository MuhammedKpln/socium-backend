import { InjectQueue } from '@nestjs/bull';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { compareHash } from 'src/cryptHelper';
import { ERROR_CODES } from 'src/error_code';
import { StarService } from 'src/star/star.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { jwtConstants } from './constans';
import { CreateUserDto } from './dtos/createUser.dto';
import { CreateUserGoogleDto } from './dtos/createUserGoogle.dto';
import { LoginUserDto } from './dtos/loginUser.dto';
import { LoginUserGoogleDto } from './dtos/loginUserGoogle.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private user: UserService,
    @InjectRepository(User) private usersService: Repository<User>,
    private starRepo: StarService,
    @InjectQueue('sendVerificationMail') private mailQueue: Queue,
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

  async validateUser(email: string, password: string): Promise<boolean> {
    const user = await this.usersService.findOne({
      email,
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
    const payload = { email: user.email };
    const userDb = await this.user.getUserByEmail(user.email);

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: userDb,
    };
  }

  async loginGoogle(user: LoginUserGoogleDto) {
    const userDb = await this.user.getUserByEmail(user.email);
    const payload = { email: userDb.email };

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
        const randomNumber = Math.floor(Math.random() * 1000000);

        await this.mailQueue.add(
          'confirmation',
          {
            to: resp.email,
            verificationCode: randomNumber,
          },
          {
            attempts: 3,
            removeOnComplete: true,
          },
        );

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

  async verifyEmail(
    email: string,
    verificationCode: number,
  ): Promise<User | false> {
    const user = await this.usersService.findOne({
      email,
    });

    if (user && user.emailConfirmationCode === verificationCode) {
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

    return false;
  }

  async resendConfirmMail(email: string): Promise<boolean> {
    const randomNumber = Math.floor(Math.random() * 1000000);

    await this.mailQueue.add(
      'confirmation',
      {
        to: email,
        verificationCode: randomNumber,
      },
      {
        attempts: 3,
        removeOnComplete: true,
      },
    );

    return true;
  }

  async validateJwt(token: string): Promise<boolean> {
    try {
      const data = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.SECRET_KEY,
      });

      if (data?.email) {
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }
}

import { InjectQueue } from '@nestjs/bull';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { ApolloError } from 'apollo-server-fastify';
import { Queue } from 'bull';
import { compareHash, hashText } from 'src/cryptHelper';
import { ERROR_CODES } from 'src/error_code';
import { getRandomString } from 'src/helpers/randomString';
import { PrismaService } from 'src/prisma/prisma.service';
import { P, QueueEvents, Queues } from 'src/types';
import { jwtConstants } from './constans';
import { CreateUserDto } from './dtos/createUser.dto';
import { CreateUserGoogleDto } from './dtos/createUserGoogle.dto';
import { ForgotPasswordDto } from './dtos/forgotPassword.dto';
import { LoginUserDto } from './dtos/loginUser.dto';
import { LoginUserGoogleDto } from './dtos/loginUserGoogle.dto';

const userIncludesMeta: Prisma.UserInclude = {
  _count: {
    select: {
      posts: true,
      followers: true,
      followings: true,
    },
  },
};

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectQueue('sendVerificationMail') private mailQueue: Queue,
    @InjectQueue(Queues.ForgotPassword) private forgotMailQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async findOne(username: string): P<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (user) {
      return user;
    }

    throw new NotFoundException(
      'Could not find user with username: ' + username,
    );
  }
  async findOneWithEmail(email: string, include?: Prisma.UserInclude): P<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include,
    });

    return user;
  }

  async validateUser(email: string, password: string): Promise<boolean> {
    const user = await this.findOneWithEmail(email);

    if (user) {
      const compare = await compareHash(password, user.password);
      if (compare) {
        return true;
      }

      return false;
    }
    return false;
  }

  async createRefreshToken(token: string, user: User) {
    const tokenCreated = await this.prisma.user.update({
      where: {
        username: user.username,
      },
      data: {
        refreshToken: token,
      },
    });

    return tokenCreated.refreshToken;
  }

  async login(user: LoginUserDto) {
    const payload = { email: user.email };
    const userDb = await this.findOneWithEmail(user.email, userIncludesMeta);
    const refreshToken = await this.createRefreshToken(
      getRandomString(10),
      userDb,
    );
    const hashedToken = await hashText(refreshToken);
    const expireDate = new Date();
    expireDate.setUTCMinutes(expireDate.getUTCMinutes() + 15);

    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: hashedToken,
      expire_date: expireDate,
      user: userDb,
    };
  }

  async refreshToken(refreshToken: string, userId: number) {
    const findUser = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (findUser) {
      const isEqual = await compareHash(findUser.refreshToken, refreshToken);

      if (isEqual) {
        const newRefreshToken = await this.createRefreshToken(
          getRandomString(10),
          findUser,
        );
        const newRefreshTokenHashed = await hashText(newRefreshToken);
        const expireDate = new Date();
        expireDate.setUTCMinutes(expireDate.getUTCMinutes() + 15);

        return {
          access_token: await this.jwtService.signAsync({
            email: findUser.email,
          }),
          refresh_token: newRefreshTokenHashed,
          expire_date: expireDate,
          user: findUser,
        };
      } else {
        throw new Error('Refresh token mismatch');
      }
    } else {
      throw new Error('Unknown refresh token');
    }
  }

  async loginGoogle(user: LoginUserGoogleDto) {
    const userDb = await this.findOneWithEmail(user.email, userIncludesMeta);
    const payload = { email: userDb.email };
    const refreshToken = await this.createRefreshToken(
      getRandomString(10),
      userDb,
    );
    const hashedToken = await hashText(refreshToken);
    const expireDate = new Date();
    expireDate.setUTCMinutes(expireDate.getUTCMinutes() + 15);

    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: hashedToken,
      expire_date: expireDate,
      user: userDb,
    };
  }

  async register(user: CreateUserDto): Promise<User> {
    const { email, password, username } = user;

    const createUser = await this.prisma.user.create({
      data: {
        username,
        email,
        password,
      },
      include: userIncludesMeta,
    });

    if (createUser) {
      await this.prisma.star.create({
        data: {
          userId: createUser.id,
        },
      });
      await this.prisma.notificationSettings.create({
        data: {
          userId: createUser.id,
        },
      });

      const randomNumber = createUser.emailConfirmationCode;

      await this.mailQueue.add(
        'confirmation',
        {
          to: createUser.email,
          verificationCode: randomNumber,
        },
        {
          attempts: 3,
          removeOnComplete: true,
        },
      );

      return createUser;
    } else {
      throw new HttpException(
        {
          status: false,
          error_code: ERROR_CODES.USER_IS_ALREADY_REGISTERED,
        },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }
  async registerGoogle(user: CreateUserGoogleDto) {
    const createUser = await this.prisma.user.create({
      data: {
        username: user.username,
        email: user.email,
        password: user.idToken,
        isEmailConfirmed: true,
      },
    });

    if (createUser) {
      await this.prisma.star.create({
        data: {
          userId: createUser.id,
        },
      });

      const refreshToken = await this.createRefreshToken(
        getRandomString(10),
        createUser,
      );
      const hashedToken = await hashText(refreshToken);
      const expireDate = new Date();
      expireDate.setUTCMinutes(expireDate.getUTCMinutes() + 15);

      return {
        access_token: await this.jwtService.signAsync({
          email: user.email,
        }),
        refresh_token: hashedToken,
        expire_date: expireDate,
        user: createUser,
      };
    }
  }

  async verifyEmail(
    email: string,
    verificationCode: number,
  ): Promise<User | false> {
    const user = await this.findOneWithEmail(email);

    if (user && user.emailConfirmationCode === verificationCode) {
      if (user) {
        const update = await this.prisma.user.update({
          where: {
            email: email,
          },
          data: {
            isEmailConfirmed: true,
            emailConfirmationCode: null,
          },
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
    const update = await this.prisma.user.update({
      where: {
        email: email,
      },
      data: {
        emailConfirmationCode: randomNumber,
      },
    });

    if (update) {
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

    return false;
  }

  async sendForgotPasswordCode(email: string): Promise<boolean> {
    const user = await this.findOneWithEmail(email);

    if (!user) {
      throw new ApolloError('Email does not exists', 'EMAIL_DOES_NOT_EXISTS', {
        error_code: ERROR_CODES.EMAIL_DOES_NOT_EXISTS,
      });
    }

    const randomNumber = Math.floor(Math.random() * 1000000);

    const update = await this.prisma.user.update({
      where: {
        email: email,
      },
      data: {
        forgotPasswordCode: randomNumber,
      },
    });

    if (update) {
      await this.forgotMailQueue.add(
        QueueEvents.SendForgotPasswordCode,
        {
          toEmail: email,
          verificationCode: randomNumber,
        },
        {
          attempts: 3,
          removeOnComplete: true,
        },
      );

      return true;
    }

    return false;
  }

  async changePassword(data: ForgotPasswordDto): Promise<boolean> {
    const { email, password } = data;
    const user = await this.findOneWithEmail(email);

    if (user) {
      await this.prisma.user.update({
        where: {
          email,
        },
        data: {
          password,
          forgotPasswordCode: null,
        },
      });

      return true;
    } else {
      return false;
    }
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

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { comparePassword } from 'src/cryptHelper';
import { ERROR_CODES } from 'src/error_code';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import { LoginUserDto } from './dtos/loginUser.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private usersService: Repository<User>,
  ) {}

  async validateUser(username: string, password: string): Promise<boolean> {
    const user = await this.usersService.findOne({
      username,
    });

    if (user) {
      const compare = await comparePassword(password, user.password);
      if (compare) {
        return true;
      }

      return false;
    }
    return false;
  }

  async login(user: LoginUserDto) {
    const payload = { username: user.username };
    const userDb = await this.usersService.findOne({
      username: user.username,
    });
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: userDb,
    };
  }

  async register(user: CreateUserDto): Promise<User> {
    const create = this.usersService.create(user);

    return this.usersService
      .save(create)
      .then((resp) => resp)
      .catch((err) => {
        throw new HttpException(
          {
            status: false,
            error_code: ERROR_CODES.USER_IS_ALREADY_REGISTERED,
          },
          HttpStatus.NOT_ACCEPTABLE,
        );
      });
  }
}

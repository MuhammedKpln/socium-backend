import { Body, Controller, Post } from '@nestjs/common';
import { ERROR_CODES } from 'src/error_code';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/createUser.dto';
import { LoginUserDto } from './dtos/loginUser.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginUserDto) {
    const { username, password } = body;

    const validateUser = await this.authService.validateUser(
      username,
      password,
    );

    if (!validateUser) {
      return {
        status: false,
        error_code: ERROR_CODES.USERNAME_OR_PASSWORD_INCORRECT,
      };
    }

    return this.authService.login({
      username,
      password,
    });
  }

  @Post('register')
  async register(@Body() user: CreateUserDto) {
    const register = await this.authService.register(user);

    if (!register) {
      return {
        status: false,
        error_code: ERROR_CODES.USERNAME_OR_PASSWORD_INCORRECT,
      };
    }

    return register;
  }
}

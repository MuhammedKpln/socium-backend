import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ERROR_CODES } from 'src/error_code';
import { response } from 'src/helpers/response';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/createUser.dto';
import { CreateUserGoogleDto } from './dtos/createUserGoogle.dto';
import { LoginUserDto } from './dtos/loginUser.dto';
import { LoginUserGoogleDto } from './dtos/loginUserGoogle.dto';
import { NotVerifiedGraphqlGuard } from './guards/not-verified-gql.guard';

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

  @Post('loginGoogle')
  async loginGoogle(@Body() body: LoginUserGoogleDto) {
    const { email, idToken } = body;

    return this.authService.loginGoogle({
      email,
      idToken,
    });
  }

  @Get('loginGoogle/:email')
  async checkIfUserIsRegistered(@Param('email') email: string) {
    const user = await this.authService.findOneWithEmail(email);

    if (user) {
      return response(user);
    }

    throw new NotFoundException();
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

  @Post('googleRegister')
  async googleRegister(@Body() user: CreateUserGoogleDto) {
    const register = await this.authService.registerGoogle(user);

    if (!register) {
      return {
        status: false,
        error_code: ERROR_CODES.USERNAME_OR_PASSWORD_INCORRECT,
      };
    }

    return register;
  }

  @Get('confirm/:email/:confirmationCode')
  @UseGuards(NotVerifiedGraphqlGuard)
  async confirmEmail(@Param('email') email: string) {
    return this.authService.verifyEmail(email);
  }
}

import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDTO, SignUpDTO } from './auth.dto';
import { Public } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async signIn(@Body() values: SignInDTO) {
    return this.authService.signIn(values);
  }

  @Public()
  @Post('signup')
  async signUp(@Body() values: SignUpDTO) {
    return this.authService.signUp(values);
  }
}

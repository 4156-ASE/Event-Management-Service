import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Put,
  Delete,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { UserInterface } from './models/user.interface';

@Controller('user')
export class UserController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async register(@Body() user: UserInterface) {
    const result = await this.usersService.register(user);
    if (!result) {
      throw new ConflictException('Email already exists');
    }
    return { message: 'User registered successfully' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() data: { email: string; password: string }) {
    const result = await this.usersService.login(data.email, data.password);
    return result;
  }

  @Get(':pid')
  async getUser(@Param('pid') pid: number) {
    const user = await this.usersService.getUser(pid);
    const { password, ...result } = user;
    return result;
  }

  @Put(':pid')
  async updateUser(
    @Param('pid') pid: number,
    @Body() user: Partial<UserInterface>,
  ) {
    const updatedUser = await this.usersService.updateUser(pid, user);
    return { message: 'User updated successfully' };
  }

  @Delete(':pid')
  async deleteUser(@Param('pid') pid: number) {
    const deleted = await this.usersService.deleteUser(pid);
    return { message: 'User deleted successfully' };
  }
}

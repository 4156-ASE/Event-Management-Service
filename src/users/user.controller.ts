import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { RegisterUserDTO, UpdateUserDTO } from './models/user.dto';

@Controller('users')
export class UserController {
  // Dependency injection of the UsersService
  constructor(private usersService: UsersService) {}

  // User registration
  @Post('register')
  async register(@Body() user: RegisterUserDTO) {
    await this.usersService.register(user);
    return { message: 'User registered successfully' };
  }

  // User login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() data: { email: string; password: string }) {
    const result = await this.usersService.login(data.email, data.password);
    return result;
  }

  // Retrieve user details by their ID
  @Get(':pid')
  async getUser(@Param('pid') pid: number) {
    const user = await this.usersService.getUser(pid);
    const { password, ...result } = user;
    return result;
  }

  // Update user details by their ID
  @Patch(':pid')
  async updateUser(@Param('pid') pid: number, @Body() user: UpdateUserDTO) {
    await this.usersService.updateUser(pid, user);
    return {
      status: HttpStatus.OK,
      message: 'User updated successfully',
    };
  }

  // Delete a user by their ID.
  @Delete(':pid')
  async deleteUser(@Param('pid') pid: number) {
    await this.usersService.deleteUser(pid);
    return { status: HttpStatus.OK, message: 'User deleted successfully' };
  }
}

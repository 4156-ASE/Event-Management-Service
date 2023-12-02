import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  HttpStatus,
  HttpException,
  Headers,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { RegisterUserDTO, UpdateUserDTO } from './models/user.dto';
import * as jwt from 'jsonwebtoken';

@Controller('users')
export class UserController {
  // Dependency injection of the UsersService
  constructor(private usersService: UsersService) {}

  // User registration
  @Post('register')
  async register(
    @Body() user: RegisterUserDTO,
    @Headers('authorization') clientToken: string,
  ) {
    const cid = this.extractCidFromToken(clientToken);
    const newUser = await this.usersService.register(user, cid);
    return { pid: newUser.pid, message: 'User registered successfully' };
  }

  // Retrieve user details by their ID
  @Get(':pid')
  async getUser(@Param('pid') pid: string) {
    const user = await this.usersService.getUser(pid);
    return user;
  }

  // Update user details by their ID
  @Patch(':pid')
  async updateUser(@Param('pid') pid: string, @Body() user: UpdateUserDTO) {
    await this.usersService.updateUser(pid, user);
    return {
      status: HttpStatus.OK,
      message: 'User updated successfully',
    };
  }

  // Delete a user by their ID.
  @Delete(':pid')
  async deleteUser(@Param('pid') pid: string) {
    await this.usersService.deleteUser(pid);
    return { status: HttpStatus.OK, message: 'User deleted successfully' };
  }

  private extractCidFromToken(token: string): string {
    try {
      const decoded = jwt.verify(token, 'secretKey');
      return decoded.cid;
    } catch (error) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
}

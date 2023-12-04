import { Controller } from '@nestjs/common';
import { UsersService } from './user.service';

@Controller('users')
export class UserController {
  // Dependency injection of the UsersService
  constructor(private _usersService: UsersService) {}

  // // User registration
  // @Post('register')
  // async register(
  //   @Body() user: RegisterUserDTO,
  //   @Headers('authorization') clientToken: string,
  // ) {
  //   const newUser = await this.usersService.register(user, clientToken);
  //   return { pid: newUser.pid, message: 'User registered successfully' };
  // }

  // // Retrieve user details by their ID
  // @Get(':pid')
  // async getUser(
  //   @Headers('authorization') clientToken: string,
  //   @Param('pid') pid: string,
  // ) {
  //   const user = await this.usersService.getUser(pid, clientToken);
  //   return user;
  // }

  // // Update user details by their ID
  // @Patch(':pid')
  // async updateUser(
  //   @Headers('authorization') clientToken: string,
  //   @Param('pid') pid: string,
  //   @Body() user: UpdateUserDTO,
  // ) {
  //   await this.usersService.updateUser(pid, user, clientToken);
  //   return {
  //     status: HttpStatus.OK,
  //     message: 'User updated successfully',
  //   };
  // }

  // // Delete a user by their ID.
  // @Delete(':pid')
  // async deleteUser(
  //   @Headers('authorization') clientToken: string,
  //   @Param('pid') pid: string,
  // ) {
  //   await this.usersService.deleteUser(pid, clientToken);
  //   return { status: HttpStatus.OK, message: 'User deleted successfully' };
  // }
}

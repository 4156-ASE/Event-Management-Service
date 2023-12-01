import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { UserEntity } from './models/user.entity';
import { LoginResponse } from './models/user.interface';
import { RegisterUserDTO, UpdateUserDTO } from './models/user.dto';

@Injectable()
export class UsersService {
  // Injection of the UserEntity repository
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async register(user: RegisterUserDTO): Promise<UserEntity | null> {
    // Check if the user with the provided email already exists

    const existUser = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (existUser) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.CONFLICT,
      );
    }

    try {
      // Save the new user to the database

      return await this.userRepository.save(user);
    } catch (error) {
      throw new HttpException(
        'Registration failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(email: string, password: string): Promise<LoginResponse | null> {
    // Find the user with the provided email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    // Check if the user exists and the password matches

    if (!user || user.password !== password) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { password: _, ...userData } = user;
    const response: LoginResponse = {
      status: 'success',
      message: 'Logged in successfully',
      data: {
        user: userData,
        token: 'alnlgsnsoajg',
        expires_in: 3600,
      },
    };

    return response;
  }

  async getUser(id: number): Promise<UserEntity | null> {
    try {
      return await this.userRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(
    id: number,
    updatedUser: UpdateUserDTO,
  ): Promise<UserEntity | null> {
    // Check if the user with the provided ID exists
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    try {
      // Update the user details in the database

      await this.userRepository.update(id, updatedUser);
      return this.userRepository.findOne({ where: { id } });
    } catch (error) {
      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    // Check if the user with the provided ID exists

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    try {
      // Delete the user from the database

      const result = await this.userRepository.delete(id);
      return result.affected > 0;
    } catch (error) {
      throw new HttpException(
        'Error deleting user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './models/user.entity';
import { UserInterface } from './models/user.interface';
import { LoginResponse } from './models/user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async register(user: UserInterface): Promise<UserEntity | null> {
    const existUser = await this.userRepository.findOne({
      where: { email: user.email },
    });
    if (existUser) return null;

    return this.userRepository.save(user);
  }

  async login(email: string, password: string): Promise<LoginResponse | null> {
    const user = await this.userRepository.findOne({
      where: { email, password },
    });
    if (user) {
      const { password, ...userData } = user;
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
    const errorResponse: LoginResponse = {
      status: 'error',
      message: 'Unauthorized',
      data: null,
    };
    return errorResponse;
  }

  async getUser(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateUser(
    id: number,
    updatedUser: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;

    await this.userRepository.update(id, updatedUser);
    return this.userRepository.findOne({ where: { id } });
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected > 0;
  }
}

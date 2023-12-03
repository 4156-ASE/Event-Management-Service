import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './models/user.entity';
import { RegisterUserDTO, UpdateUserDTO } from './models/user.dto';
import { randomBytes } from 'crypto';
import { ClientEntity } from './models/client.entity';

@Injectable()
export class UsersService {
  // Injection of the UserEntity repository
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ClientEntity)
    private clientRepository: Repository<ClientEntity>,
  ) {}

  async register(
    user: RegisterUserDTO,
    clientToken: string,
  ): Promise<UserEntity> {
    // check authorization of the header
    const client = await this.clientRepository.findOne({
      where: { client_token: clientToken },
    });
    if (!client) {
      throw new HttpException('Client does not match', HttpStatus.UNAUTHORIZED);
    }

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
      const newUser = this.userRepository.create(user);
      newUser.client = client;
      newUser.pid = randomBytes(16).toString('hex');
      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new HttpException(
        'Registration failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUser(pid: string, clientToken: string): Promise<UserEntity> {
    // check authorization of the header
    const client = await this.clientRepository.findOne({
      where: { client_token: clientToken },
    });
    if (!client) {
      throw new HttpException('Client does not match', HttpStatus.UNAUTHORIZED);
    }
    try {
      return await this.userRepository.findOneOrFail({
        where: { pid: pid, client: { cid: client.cid } },
      });
    } catch (error) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  async updateUser(
    pid: string,
    updatedUser: UpdateUserDTO,
    clientToken: string,
  ): Promise<UserEntity> {
    // check authorization of the header
    const client = await this.clientRepository.findOne({
      where: { client_token: clientToken },
    });
    if (!client) {
      throw new HttpException('Client does not match', HttpStatus.UNAUTHORIZED);
    }
    // Check if the user with the provided ID exists
    const user = await this.userRepository.findOne({
      where: { pid: pid, client: { cid: client.cid } },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    try {
      // Update the user details in the database

      await this.userRepository.update(pid, updatedUser);
      return this.userRepository.findOne({ where: { pid } });
    } catch (error) {
      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteUser(pid: string, client_token: string): Promise<boolean> {
    // check authorization of the header
    const client = await this.clientRepository.findOne({
      where: { client_token: client_token },
    });
    if (!client) {
      throw new HttpException('Client does not match', HttpStatus.UNAUTHORIZED);
    }

    // Check if the user with the provided ID exists

    const user = await this.userRepository.findOne({
      where: { pid, client: { cid: client.cid } },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    try {
      // Delete the user from the database

      const result = await this.userRepository.delete(pid);
      return result.affected > 0;
    } catch (error) {
      throw new HttpException(
        'Error deleting user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

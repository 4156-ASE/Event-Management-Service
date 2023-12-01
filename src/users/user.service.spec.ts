/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './user.service';
import { UserEntity } from './models/user.entity';
import { Entity, EntityNotFoundError } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UsersService', () => {
  let userService: UsersService;
  const mockUsers: UserEntity[] = [
    {
      id: 1,
      first_name: 'andrew',
      last_name: 'rockefeller',
      email: 'andrew@gmail.com',
      password: '123456',
    },
    {
      id: 2,
      first_name: 'bob',
      last_name: 'burman',
      email: 'bob@gmail.com',
      password: '123456',
    },
    {
      id: 3,
      first_name: 'charlie',
      last_name: 'chaplin',
      email: 'test3@email.com',
      password: '123456',
    },
  ];
  const mockUserRepository = {
    findOne: jest.fn().mockImplementation((arg) => {
      // if arg has where.email field, return the user with that email
      if (arg.where.email) {
        for (const item of mockUsers) {
          if (item.email == arg.where.email) {
            return Promise.resolve(item);
          }
        }
      } else if (arg.where.id) {
        for (const item of mockUsers) {
          if (item.id == arg.where.id) {
            return Promise.resolve(item);
          }
        }
      }
      return Promise.resolve(null);
    }),
    save: jest.fn().mockImplementation((user) => {
      if (user.id) {
        for (const item of mockUsers) {
          if (item.id == user.id) {
            Object.assign(item, user);
            return Promise.resolve(item);
          }
        }
      } else {
        const new_user = {
          id: mockUsers.length + 1,
          ...user,
        };
        mockUsers.push(new_user);
        return Promise.resolve(new_user);
      }
    }),
    findOneOrFail: jest.fn().mockImplementation((arg) => {
      // if arg has where.email field, return the user with that email
      if (arg.where.email) {
        for (const item of mockUsers) {
          if (item.email == arg.where.email) {
            return Promise.resolve(item);
          }
        }
      } else if (arg.where.id) {
        for (const item of mockUsers) {
          if (item.id == arg.where.id) {
            return Promise.resolve(item);
          }
        }
      }
      return Promise.reject(new EntityNotFoundError(UserEntity, arg.where));
    }),
    update: jest.fn().mockImplementation((id, user) => {
      for (const item of mockUsers) {
        if (item.id == id) {
          Object.assign(item, user);
          return Promise.resolve(item);
        }
      }
      return Promise.reject(new EntityNotFoundError(UserEntity, id));
    }),
    delete: jest.fn().mockImplementation((id) => {
      for (let i = 0; i < mockUsers.length; i++) {
        if (mockUsers[i].id === id) {
          mockUsers.splice(i, 1);
          return Promise.resolve({ raw: [], affected: 1 });
        }
      }
      return Promise.resolve({ raw: [], affected: 0 });
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('register: new user', async () => {
    const newUser = {
      first_name: 'test',
      last_name: 'test',
      email: 'new@email.com',
      password: '123456',
    };
    await expect(userService.register(newUser)).resolves.toEqual({
      id: mockUsers.length + 1,
      ...newUser,
    });
  });

  it('register: existing user', async () => {
    const { id, ...user } = mockUsers[0];
    await expect(userService.register(user)).rejects.toThrow(
      new HttpException(
        'User with this email already exists',
        HttpStatus.CONFLICT,
      ),
    );
  });

  it('login: correct email and password', async () => {
    const { password, ...user } = mockUsers[0];
    await expect(userService.login(user.email, password)).resolves.toEqual({
      status: 'success',
      message: 'Logged in successfully',
      data: {
        user: user,
        token: 'alnlgsnsoajg',
        expires_in: 3600,
      },
    });
  });

  it('login: incorrect email', async () => {
    const { password, ...user } = mockUsers[0];
    await expect(
      userService.login('incorrect@email.com', password),
    ).rejects.toThrow(
      new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED),
    );
  });

  it('login: incorrect password', async () => {
    const { password, ...user } = mockUsers[0];
    await expect(
      userService.login(user.email, 'incorrectpassword'),
    ).rejects.toThrow(
      new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED),
    );
  });

  it('getUser: existing user', async () => {
    const { password, ...user } = mockUsers[0];
    await expect(userService.getUser(user.id)).resolves.toEqual(mockUsers[0]);
  });

  it('getUser: non-existing user', async () => {
    await expect(userService.getUser(100)).rejects.toThrow(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );
  });

  it('updateUser: existing user', async () => {
    const { id, ...user } = mockUsers[0];
    const updatedUser = {
      first_name: 'updated',
      last_name: 'updated',
      email: 'new@email.com',
      password: '123456',
    };
    await expect(userService.updateUser(id, updatedUser)).resolves.toEqual({
      id: id,
      ...updatedUser,
    });
  });

  it('updateUser: non-existing user', async () => {
    const { id, ...user } = mockUsers[0];
    const updatedUser = {
      first_name: 'updated',
      last_name: 'updated',
      email: 'new@email.com',
      password: '123456',
    };
    await expect(userService.updateUser(10, updatedUser)).rejects.toThrow(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );
  });

  it('deleteUser: existing user', async () => {
    const { id, ...user } = mockUsers[0];
    await expect(userService.deleteUser(id)).resolves.toEqual(true);
  });

  it('deleteUser: non-existing user', async () => {
    await expect(userService.deleteUser(10)).rejects.toThrow(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );
  });
});

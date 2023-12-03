/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './user.service';
import { UserEntity } from './models/user.entity';
import { Entity, EntityNotFoundError } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UsersService', () => {
  let userService: UsersService;
  const mockClient = {
    cid: '1',
    client_token: 'token',
    admin_email: 'admin@example.com',
  };
  const mockUsers: UserEntity[] = [
    {
      pid: '1',
      client: mockClient,
      first_name: 'andrew',
      last_name: 'rockefeller',
      email: 'andrew@gmail.com',
      user_type: 'admin' as 'admin' | 'regular',
    },
    {
      pid: '2',
      client: mockClient,
      first_name: 'bob',
      last_name: 'burman',
      email: 'bob@gmail.com',
      user_type: 'admin' as 'admin' | 'regular',
    },
    {
      pid: '3',
      client: mockClient,
      first_name: 'charlie',
      last_name: 'chaplin',
      email: 'test3@email.com',
      user_type: 'admin' as 'admin' | 'regular',
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
          if (item.pid == arg.where.id) {
            return Promise.resolve(item);
          }
        }
      }
      return Promise.resolve(null);
    }),
    save: jest.fn().mockImplementation((user) => {
      if (user.id) {
        for (const item of mockUsers) {
          if (item.pid == user.id) {
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
          if (item.pid == arg.where.id) {
            return Promise.resolve(item);
          }
        }
      }
      return Promise.reject(new EntityNotFoundError(UserEntity, arg.where));
    }),
    update: jest.fn().mockImplementation((id, user) => {
      for (const item of mockUsers) {
        if (item.pid == id) {
          Object.assign(item, user);
          return Promise.resolve(item);
        }
      }
      return Promise.reject(new EntityNotFoundError(UserEntity, id));
    }),
    delete: jest.fn().mockImplementation((id) => {
      for (let i = 0; i < mockUsers.length; i++) {
        if (mockUsers[i].pid === id) {
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
      user_type: 'admin' as 'admin' | 'regular',
    };
    await expect(userService.register(newUser, 'token')).resolves.toContain({
      ...newUser,
    });
  });

  it('register: existing user', async () => {
    const { pid, ...user } = mockUsers[0];
    await expect(userService.register(user, 'token')).rejects.toThrow(
      new HttpException(
        'User with this email already exists',
        HttpStatus.CONFLICT,
      ),
    );
  });

  it('getUser: existing user', async () => {
    await expect(
      userService.getUser(mockUsers[0].pid, 'token'),
    ).resolves.toEqual(mockUsers[0]);
  });

  it('getUser: non-existing user', async () => {
    await expect(userService.getUser('100', 'token')).rejects.toThrow(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );
  });

  it('updateUser: existing user', async () => {
    const updatedUser = {
      first_name: 'updated',
      last_name: 'updated',
      email: 'new@email.com',
    };
    await expect(
      userService.updateUser(mockUsers[0].pid, updatedUser, 'token'),
    ).resolves.toContain({
      ...updatedUser,
    });
  });

  it('updateUser: non-existing user', async () => {
    const updatedUser = {
      first_name: 'updated',
      last_name: 'updated',
      email: 'new@email.com',
    };
    await expect(
      userService.updateUser('100', updatedUser, 'token'),
    ).rejects.toThrow(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );
  });

  it('deleteUser: existing user', async () => {
    await expect(
      userService.deleteUser(mockUsers[0].pid, 'token'),
    ).resolves.toEqual(true);
  });

  it('deleteUser: non-existing user', async () => {
    await expect(userService.deleteUser('100', 'token')).rejects.toThrow(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );
  });
});

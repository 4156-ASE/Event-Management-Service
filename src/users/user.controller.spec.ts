import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UsersService } from './user.service';
import { UserInterface } from './models/user.interface';
import { UserEntity } from './models/user.entity';
import { LoginResponse } from './models/user.interface';
import { ConflictException } from '@nestjs/common';
import { randomInt } from 'crypto';

describe('UserController', () => {
  let userController: UserController;
  const mockUserService = {
    register: jest.fn((user: UserInterface): Promise<UserEntity | null> => {
      if (user.email == 'testregisterfail@gmail.com') {
        return Promise.resolve(null);
      }
      else if (user.email == 'testregistersuccess@gmail.com') {
        return Promise.resolve({
          id: randomInt(100),
          ...user
        });
      }

      else if (user.email == "invalidemail"){
        return Promise.resolve(null);  // TODO: change this to new type of exception
      }
    }),
    login: jest.fn((email: string, password: string): Promise<LoginResponse | null> => {
      return Promise.resolve({
        status: 'success',
        message: 'Logged in successfully',
        data: {
          user: {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: 'testloginsuccess@test.com'
          },
          token: 'alnlgsnsoajg',
          expires_in: 3600,
        }
      });
    }),
    getUser: jest.fn((id: number): Promise<UserEntity | null> => {
      if (id == 0) {
        return Promise.resolve(null);
      }
      else{
        return Promise.resolve({
          id: id,
          first_name: 'John',
          last_name: 'Doe',
          email: 'getUser@test.com',
          password: 'encodedpassword'
        });
      }
    }),
    updateUser: jest.fn((id: number, updatedUser: Partial<UserEntity>): Promise<UserEntity | null> => {
      if(id == 0){
        return Promise.resolve(null);
      }
      else{
        return Promise.resolve({
          id: id,
          first_name: 'John',
          last_name: 'Doe',
          email: 'updateUser@test.com',
          password: 'encodedpassword'
        });
      }
    }),
    deleteUser: jest.fn((id: number): Promise<boolean> => {
      if (id == 0) {
        return Promise.resolve(false);
      }
      else{
        return Promise.resolve(true);
      }
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UsersService],
    }).overrideProvider(UsersService)
      .useValue(mockUserService)
      .compile();

    userController = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });
  it('register fail: should throw conflict', async () => {
    const user = {
      id: null,
      first_name: 'John',
      last_name: 'Doe',
      email: 'testregisterfail@gmail.com',
      password: 'encodedpassword'
    }
    await expect(userController.register(user)).rejects.toThrow(new ConflictException('Email already exists'));
  });
  it('register successful: should return message', async () => {
    const user = {
      id: null,
      first_name: 'John',
      last_name: 'Doe',
      email: 'testregistersuccess@gmail.com',
      password: 'encodedpassword'
    }
    await expect(userController.register(user)).resolves.toEqual({ message: 'User registered successfully' });
  });

  it('login', async () => {
    const data = {
      email: "testloginsuccess@test.com",
      password: "encodedpassword",
    }
    await expect(userController.login(data)).resolves.toEqual({
      status: 'success',
      message: 'Logged in successfully',
      data: {
        user: {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'testloginsuccess@test.com'
        },
        token: 'alnlgsnsoajg',
        expires_in: 3600,
      }
    });
  });

  it('getUser: not found', async() => {
    const pid = 0;
    await expect(userController.getUser(pid)).rejects.toThrow();  // new error
  })

  it('getUser: found', async() => {
    const pid = 2;
    await expect(userController.getUser(pid)).resolves.toEqual({
      id: pid,
      first_name: 'John',
      last_name: 'Doe',
      email: 'getUser@test.com'
    });
  });

  it('updateUser: not found', async() => {
    const pid = 0;  // a mock user with id 0 does not exist
    const updatedUser = {
      first_name: 'John',
      last_name: 'Doe',
      email: ''
    };
    await expect(userController.updateUser(pid, updatedUser)).rejects.toThrow();
  });

  it('updateUser: found', async() => {
    const pid = 1;
    const updatedUser = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'updateUser@test.com',
      password: 'encodedpassword'
    };
    await expect(userController.updateUser(pid, updatedUser)).resolves.toEqual({ message: 'User updated successfully' });
  });

  it('deleteUser', async() => {
    const pid = 1;
    await expect(userController.deleteUser(pid)).resolves.toEqual({ message: 'User deleted successfully' });
  });
});

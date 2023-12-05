import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UsersService } from './user.service';
import { UserEntity } from './models/user.entity';
import { RegisterUserDTO, UpdateUserDTO } from './models/user.dto';

describe('UserController', () => {
  let userController: UserController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            register: jest.fn().mockResolvedValue(new UserEntity()),
            getUser: jest.fn().mockResolvedValue(new UserEntity()),
            updateUser: jest.fn().mockResolvedValue(new UserEntity()),
            deleteUser: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const userDto: RegisterUserDTO = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        user_type: 'admin',
      };
      const clientToken = 'some-client-token';
      jest
        .spyOn(usersService, 'register')
        .mockImplementation(async () => new UserEntity());

      const result = await userController.register(userDto, clientToken);

      expect(usersService.register).toHaveBeenCalledWith(userDto, clientToken);
      expect(result).toBeDefined();
    });
  });

  describe('getUser', () => {
    it('should return a user', async () => {
      const pid = 'some-pid';
      const clientToken = 'some-client-token';
      jest
        .spyOn(usersService, 'getUser')
        .mockImplementation(async () => new UserEntity());

      const result = await userController.getUser(clientToken, pid);

      expect(usersService.getUser).toHaveBeenCalledWith(pid, clientToken);
      expect(result).toBeDefined();
    });
  });

  describe('updateUser', () => {
    it('should update user information', async () => {
      const pid = 'some-pid';
      const clientToken = 'some-client-token';
      const userDto: UpdateUserDTO = {
        first_name: 'Updated',
        last_name: 'User',
        email: 'updated@example.com',
      };
      jest
        .spyOn(usersService, 'updateUser')
        .mockImplementation(async () => new UserEntity());

      const result = await userController.updateUser(clientToken, pid, userDto);

      expect(usersService.updateUser).toHaveBeenCalledWith(
        pid,
        userDto,
        clientToken,
      );
      expect(result).toBeDefined();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const pid = 'some-pid';
      const clientToken = 'some-client-token';
      jest
        .spyOn(usersService, 'deleteUser')
        .mockImplementation(async () => true);

      const result = await userController.deleteUser(clientToken, pid);

      expect(usersService.deleteUser).toHaveBeenCalledWith(pid, clientToken);
      expect(result).toBeDefined();
    });
  });
});

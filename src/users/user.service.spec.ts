import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UsersService } from "./user.service";
import { UserEntity } from "./models/user.entity";
import { log } from "console";

describe('UsersService', () => {
  let userService: UsersService;
  const exampleUser = {  // example user data
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'testuser@test.com',
    password: 'encryptedPassword'
  };
  const mockUserRepository = {
    findOne: jest.fn((arg):Promise<null | UserEntity> => {
      // if (arg.where.email == 'newuser@register.com') {
      //   log("here");
      //   return Promise.resolve(null);
      // }
      if (arg.where.email == 'existinguser@register.com'){
        const {email, ...userData} = exampleUser;
        return Promise.resolve({
          email: email,
          ...userData
        });
      }
      else if (arg.where.email == 'success@login.com' 
      && arg.where.password == 'successPassword'){
        const {password, email, ...userData} = exampleUser;
        return Promise.resolve({
          email: arg.where.email,
          password: arg.where.password,
          ...userData
        });
      }
      else if (arg.where.id == 1){
        return Promise.resolve(exampleUser);
      }
      else{
        return Promise.resolve(null);
      }
    }),
    save: jest.fn((user):Promise<UserEntity> => {
      return Promise.resolve(user);
    }),
    update: jest.fn((id: number, updatedUser: Partial<UserEntity>):Promise<UserEntity> => {
      const updated = {  // overwrite the user with the updated fields
        ...exampleUser,
        ...updatedUser,
        id: id
      };
      return Promise.resolve(updated);
    }),
    delete: jest.fn((id: number) => {
      if (id == 1){
        return Promise.resolve({
          affected: 1
        });
      }
      else{
        return Promise.resolve({
          affected: 0
        });
      }
    })
  };
  beforeEach(async () => {
    const module:TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository
        }
      ]
    }).compile();

    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('register: existing user should return null', async () => {
    const user = {...exampleUser};
    user.email = 'existinguser@register.com';  // change email to existing user
    const result = await userService.register(user);
    expect(result).toBeNull();
  });

  it('register: new user should return user', async () => {
    const user = {...exampleUser};
    user.email = 'newuser@register.com';  // change email to new user
    const result = await userService.register(user);
    expect(result).toEqual(user);
  });

  it('login: successful login should return LoginResponse', async () => {
    const user = {...exampleUser};
    user.email = "success@login.com";
    user.password = "successPassword";
    const {password, ...userData} = user;  // remove password from user data
    const result = await userService.login(user.email, user.password);
    expect(result).toEqual({
      status: 'success',
      message: 'Logged in successfully',
      data:{
        user: userData,
        token: 'alnlgsnsoajg',
        expires_in: 3600
      }
    });
  });

  it('login: failed login should return LoginResponse', async () => {
    const user = {...exampleUser};
    user.email = "failed@login.com";
    user.password = "failedPassword";
    const result = await userService.login(user.email, user.password);
    expect(result).toEqual({
      status: 'error',
      message: 'Unauthorized',
      data: null
    });
  });

  it('getUser: existing user should return user', async () => {
    const user = {...exampleUser};
    const result = await userService.getUser(user.id);
    expect(result).toEqual(user);
  });

  it('getUser: non-existing user should return null', async () => {
    const user = {...exampleUser};
    user.id = 2;
    const result = await userService.getUser(user.id);
    expect(result).toBeNull();
  });

  it('updateUser: existing user should return updated user', async () => {
    const user = {...exampleUser};
    const updatedUser = {
      first_name: 'updatedFirstName',
      last_name: 'updatedLastName',
      email: 'test@update.com',
      password: 'updatedPassword'
    };  // create a partial user data
    const result = await userService.updateUser(user.id, updatedUser);
    expect(result).toEqual(user);
  });

  it('updateUser: non-existing user should return null', async () => {
    const user = {...exampleUser};
    user.id = 2;
    const updatedUser = {
      first_name: 'updatedFirstName',
      last_name: 'updatedLastName',
      email: 'test@update.com',
      password: 'updatedPassword'
    };
    const result = await userService.updateUser(user.id, updatedUser);
    expect(result).toBeNull();
  });

  it('deleteUser: existing user should return true', async () => {
    const user = {...exampleUser};
    const result = await userService.deleteUser(user.id);
    expect(result).toBe(true);
  });

  it('deleteUser: non-existing user should return false', async () => {
    const user = {...exampleUser};
    user.id = 2;
    const result = await userService.deleteUser(user.id);
    expect(result).toBe(false);
  });
});
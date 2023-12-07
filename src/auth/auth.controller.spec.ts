import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInDTO, SignUpDTO } from './auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    signIn: jest.fn(() => 'token'),
    signUp: jest.fn(() => 'token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should sign in', async () => {
    const values: SignInDTO = {
      access_id: 'access_id',
      access_secret: 'access_secret',
    };
    expect(await controller.signIn(values)).toBe('token');
  });

  it('should sign up', async () => {
    const values: SignUpDTO = {
      access_id: 'access_id',
      access_secret: 'access_secret',
    };
    expect(await controller.signUp(values)).toBe('token');
  });
});

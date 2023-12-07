import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should allow access for public routes', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const context = createMockExecutionContext();
    expect(await authGuard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException if no token', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const context = createMockExecutionContext(false);
    await expect(authGuard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error());

    const context = createMockExecutionContext();
    await expect(authGuard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return true if token is valid', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({});

    const context = createMockExecutionContext();
    expect(await authGuard.canActivate(context)).toBe(true);
  });

  it('extractTokenFromHeader should return token', () => {
    const context = createMockExecutionContext();
    const token = authGuard['extractTokenFromHeader'](
      context.switchToHttp().getRequest(),
    );

    expect(token).toBe('someToken');
  });

  it('extractTokenFromHeader should return undefined', () => {
    const context = createMockExecutionContext(false);
    const token = authGuard['extractTokenFromHeader'](
      context.switchToHttp().getRequest(),
    );

    expect(token).toBeUndefined();
  });

  it('extractTokenFromHeader should return undefined', () => {
    const context = createMockExecutionContext(false);
    const tmp = context.switchToHttp().getRequest();
    tmp.headers = {};
    const token = authGuard['extractTokenFromHeader'](tmp);

    expect(token).toBeUndefined();
  });

  function createMockExecutionContext(
    hasToken: boolean = true,
  ): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: hasToken ? 'Bearer someToken' : '',
          },
        }),
      }),
      getHandler: () => {},
      getClass: () => {},
    } as unknown as ExecutionContext;
  }
});

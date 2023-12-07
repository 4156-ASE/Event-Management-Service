import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ClientsService } from 'src/clients/clients.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { mock } from 'node:test';

// jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let clientsService: ClientsService;
  let jwtService: JwtService;

  const mockClientsService = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ClientsService, useValue: mockClientsService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    clientsService = module.get<ClientsService>(ClientsService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should sign in a client', async () => {
    mockClientsService.findOne.mockResolvedValue({
      access_id: 'test',
      access_secret: 'secret',
    });
    mockJwtService.signAsync.mockResolvedValue('token');
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    await expect(authService.signIn({ access_id: 'test', access_secret: 'secret' }))
        .resolves.toBe('token');
  });


  it('should throw UnauthorizedException if client not found', async () => {
    mockClientsService.findOne.mockResolvedValue(null);

    await expect(authService.signIn({ access_id: 'test', access_secret: 'secret' }))
      .rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if password is incorrect', async () => {
    mockClientsService.findOne.mockResolvedValue({
      access_id: 'test',
      access_secret: 'secret',
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
    await expect(authService.signIn({ access_id: 'test', access_secret: 'secret' }))
      .rejects.toThrow(UnauthorizedException);
  });

  it('should sign up a client', async () => {
    mockClientsService.findOne.mockResolvedValue(null);
    mockClientsService.save.mockResolvedValue({
      cid: 'cid',
      access_id: 'test',
      access_secret: 'secret',
    });
    mockJwtService.signAsync.mockResolvedValue('token');
    await expect(authService.signUp({ access_id: 'test', access_secret: 'secret' }))
      .resolves.toBe('token');

  });

  it('should throw ConflictException if client already exists', async () => {
    mockClientsService.findOne.mockResolvedValue({});

    await expect(authService.signUp({ access_id: 'test', access_secret: 'secret' }))
      .rejects.toThrow(ConflictException);
  });

});

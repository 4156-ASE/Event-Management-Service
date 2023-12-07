import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientEntity } from 'src/clients/models/client.entity';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('ClientsService', () => {
  let service: ClientsService;
  let repositoryMock: { findOne: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    repositoryMock = { findOne: jest.fn(), save: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(ClientEntity),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_secret' as never);
  });

  describe('findOne', () => {
    it('should return a client if found', async () => {
      const clientData = { access_id: 'test', access_secret: 'secret' };
      repositoryMock.findOne.mockResolvedValue(clientData);

      const result = await service.findOne({ where: { access_id: 'test' } });
      expect(result).toEqual(clientData);
    });

    it('should return null if no client is found', async () => {
      repositoryMock.findOne.mockResolvedValue(null);

      const result = await service.findOne({ where: { access_id: 'test' } });
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should throw BadRequestException if a client with the same access_id exists', async () => {
      repositoryMock.findOne.mockResolvedValue({});

      await expect(
        service.save({ access_id: 'test', access_secret: 'secret' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should save and return a client if access_id is unique', async () => {
      repositoryMock.findOne.mockResolvedValue(null);
      repositoryMock.save.mockImplementation((client) =>
        Promise.resolve(client),
      );

      const result = await service.save({
        access_id: 'test',
        access_secret: 'secret',
      });

      expect(repositoryMock.save).toHaveBeenCalledWith({
        access_id: 'test',
        access_secret: 'hashed_secret',
      });
      expect(result).toEqual({
        access_id: 'test',
        access_secret: 'hashed_secret',
      });
    });
  });

  // Additional utility methods or mocks can be added here if needed
});

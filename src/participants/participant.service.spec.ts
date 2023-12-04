/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ParticipantsService } from './participant.service';
import { ParticipantEntity } from './models/participant.entity';
import { UserEntity } from '../../src/users/models/user.entity';
import { EventEntity } from '../../src/events/models/event.entity';
import { ClientEntity } from 'src/users/models/client.entity';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';

describe('ParticipantsService', () => {
  let participantService: ParticipantsService;
  const exampleUser1 = {
    pid: '1',
    first_name: 'John',
    last_name: 'Host',
    email: 'testuser@test.com',
    password: 'encryptedPassword',
  };
  const exampleUser2 = {
    pid: '2',
    first_name: 'Harry',
    last_name: 'Participant',
    email: 'harry@test.com',
    password: 'encryptedPassword',
  };
  const exampleUser3 = {
    pid: '3',
    first_name: 'test',
    last_name: 'ToBeInvited',
    email: 'invite@test.com',
    password: 'encryptedPassword',
  };
  const exampleEvent = {
    eid: '1234',
    title: 'Test Event',
    desc: 'This is a test event',
    start_time: new Date('December 17, 1995 03:24:00'),
    end_time: new Date('December 18, 1995 03:24:00'),
    location: 'Test Location',
    host: 1,
  };
  const exampleUsers = [exampleUser1, exampleUser2, exampleUser3];
  const exampleClients = [
    {
      id: '1234',
      client_token: 'qwe',
      admin_emial: 'a@gmail.com',
    },
  ];
  const exampleParticipant = {
    id: '1',
    user: {
      ...exampleUser2,
    },
    event: {
      ...exampleEvent,
    },
    status: 'Test Status',
  };
  const headers = { authorization: exampleClients[0].client_token };

  const mockUserRepository = {
    findOne: jest.fn((arg) => {
      if (arg.where.email === exampleUser3.email) {
        return Promise.resolve(exampleUser3);
      } else if (arg.where.email === exampleUser2.email) {
        return Promise.resolve(exampleUser2);
      } else if (arg.where.pid === exampleUser2.pid) {
        return Promise.resolve(exampleUser2);
      } else {
        return Promise.resolve(null);
      }
    }),
    save: jest.fn((user) => {
      return Promise.resolve(user);
    }),
  };
  const mockEventRepository = {
    findOne: jest.fn((arg) => {
      const client = mockClientRepository.findOne({ where: arg.where.client });
      if (!client) {
        return Promise.resolve(null);
      }
      if (arg.where.eid === exampleEvent.eid) {
        return Promise.resolve(exampleEvent);
      } else {
        return Promise.resolve(null);
      }
    }),
  };
  const mockClientRepository = {
    findOne: jest.fn((arg) => {
      let item = null;
      Object.keys(arg.where).some((key) => {
        exampleClients.forEach((client) => {
          if (client[key] === arg.where[key]) {
            item = client;
          }
        });
      });
      return item;
    }),
  };
  const mockParticipantRepository = {
    findOne: jest.fn((arg) => {
      try {
        if (arg.where.user.pid === exampleUser3.pid) {
          return Promise.resolve(exampleParticipant);
        } else if (Object.keys(arg.where).length === 1 && arg.where.user) {
          const user = mockUserRepository.findOne({ where: arg.where.user });
          if (user) {
            return Promise.resolve(exampleParticipant);
          }
        } else if (arg.where.id === exampleParticipant.id) {
          return Promise.resolve(exampleParticipant);
        } else if (
          arg.where.event === exampleEvent &&
          arg.where.user === exampleUser2
        ) {
          return Promise.resolve(exampleParticipant);
        } else if (
          arg.where.event.eid === exampleEvent.eid &&
          arg.where.user.pid === exampleUser2.pid
        ) {
          return Promise.resolve(exampleParticipant);
        } else {
          return Promise.resolve(null);
        }
      } catch (error) {
        return Promise.resolve(null);
      }
    }),
    find: jest.fn((arg) => {
      if (
        arg.where.event.eid === exampleEvent.eid &&
        arg.relations[0] === 'user'
      ) {
        return Promise.resolve([exampleParticipant]);
      } else {
        return Promise.resolve(null);
      }
    }),
    save: jest.fn((participant) => {
      return Promise.resolve(participant);
    }),
    delete: jest.fn((participant) => {
      if (participant.id === exampleParticipant.id) {
        return Promise.resolve({
          affected: 1,
        });
      } else {
        return Promise.resolve({
          affected: 0,
        });
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipantsService,
        {
          provide: getRepositoryToken(ParticipantEntity),
          useValue: mockParticipantRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(EventEntity),
          useValue: mockEventRepository,
        },
        {
          provide: getRepositoryToken(ClientEntity),
          useValue: mockClientRepository,
        },
      ],
    }).compile();

    participantService = module.get<ParticipantsService>(ParticipantsService);
  });

  // unit tests for the participant service
  it('should be defined', () => {
    expect(participantService).toBeDefined();
  });

  it('inviteParticipant: invalid event should throw NotFoundException', async () => {
    const result = participantService.inviteParticipant(
      headers,
      'invalidEventId',
      exampleUser3,
    );
    await expect(result).rejects.toThrowError(NotFoundException);
    await expect(result).rejects.toThrowError('Event not found');
  });

  it('inviteParticipant: invalid user should throw NotFoundException', async () => {
    const result = participantService.inviteParticipant(
      headers,
      exampleEvent.eid,
      {
        first_name: 'test',
        last_name: 'test',
        email: 'invalid@test.com',
      },
    );
    await expect(result).rejects.toThrowError(NotFoundException);
    await expect(result).rejects.toThrowError('User not found');
  });

  it('inviteParticipant: existing participant should throw ConflictException', async () => {
    const result = participantService.inviteParticipant(
      headers,
      exampleEvent.eid,
      exampleUser2,
    );
    await expect(result).rejects.toThrowError(ConflictException);
    await expect(result).rejects.toThrowError(
      'Participant already exists in the event',
    );
  });

  it('updateParticipant: successful update should return user entity', async () => {
    const result = await participantService.updateParticipant(
      headers,
      exampleEvent.eid,
      exampleParticipant.user.pid,
      exampleUser2,
    );
    const { pid: id, password, ...userData } = exampleUser2;
    expect(result).toEqual({
      pid: exampleUser2.pid,
      password: exampleUser2.password,
      ...userData,
    });
  });

  it('updateParticipant: invalid event should throw NotFoundException', async () => {
    const result = participantService.updateParticipant(
      headers,
      'invalidEventId',
      exampleParticipant.user.pid,
      exampleUser3,
    );
    await expect(result).rejects.toThrowError('Event not found');
  });

  it('updateParticipant: invalid user should throw NotFoundException', async () => {
    const result = participantService.updateParticipant(
      headers,
      exampleEvent.eid,
      '100',
      exampleUser3,
    );
    await expect(result).rejects.toThrowError(
      'Participant not associated with this event',
    );
  });

  it('deleteParticipant: successful delete should return void', async () => {
    const result = await participantService.deleteParticipant(
      headers,
      exampleParticipant.id,
    );
    expect(result).toBeUndefined();
  });

  it('deleteParticipant: invalid participant should throw NotFoundException', async () => {
    const result = participantService.deleteParticipant(headers, '100');
    await expect(result).rejects.toThrowError('Participant not found');
  });

  it('listParticipants: successful list should return list of participants', async () => {
    const result = await participantService.listParticipants(
      headers,
      exampleEvent.eid,
    );
    expect(result).toEqual([exampleParticipant]);
  });

  it('updateStatus: invalid participant should throw NotFoundException', async () => {
    const result = participantService.updateStatus('100', '1', 'New Status');
    await expect(result).rejects.toThrowError('Participant not found');
  });
});

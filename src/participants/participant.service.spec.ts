/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ParticipantsService } from './participant.service';
import { ParticipantEntity } from './models/participant.entity';
import { UserEntity } from '../../src/users/models/user.entity';
import { EventEntity } from '../../src/events/models/event.entity';
import { randomBytes, randomInt } from 'crypto';
import { ClientEntity } from '../../src/users/models/client.entity';
import {
  createClient,
  createEvent,
  createParticipant,
  createUser,
  randomEmail,
  randomString,
} from '../test.util';
import { mock } from 'node:test';
import { ConflictException, HttpException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Not } from 'typeorm';

describe('ParticipantsService', () => {

  let participantService: ParticipantsService;
  const mockClients: ClientEntity[] = [
    createClient(),
    createClient(),
  ];
  const mockUsers: UserEntity[] = [
    createUser(mockClients[0], 'admin'),
    createUser(mockClients[0], 'regular'),
    createUser(mockClients[0], 'regular'),
    createUser(mockClients[0], 'regular'),

    createUser(mockClients[1], 'admin'),
    createUser(mockClients[1], 'regular'),
    createUser(mockClients[1], 'regular'),
    createUser(mockClients[1], 'regular'),
  ];
  const mockEvents: EventEntity[] = [
    createEvent(mockClients[0], mockUsers[1]),
    createEvent(mockClients[1], mockUsers[5]),
  ];
  const mockParticipants: ParticipantEntity[] = [
    createParticipant(mockUsers[2], mockEvents[0], 'pending'),
    createParticipant(mockUsers[6], mockEvents[1], 'accept'),
  ];

  const mockClientRepository = {
    findOne: jest.fn((arg) => {
      const client = mockClients.find((client) => client.client_token == arg.where.client_token);
      if (client) {
        return Promise.resolve(client);
      } else {
        return Promise.resolve(null);
      }
    }),
  };
  const mockUserRepository = {
    findOne: jest.fn((arg) => {
      const user = mockUsers.find((user) => {
        if (arg.where.client && arg.where.email){
          return user.client.cid == arg.where.client.cid && user.email == arg.where.email;
        }
        else if (arg.where.pid){
          return user.pid == arg.where.pid;
        }
        else{
          return false;
        }
      });
      if (user) {
        return Promise.resolve(user);
      } else {
        return Promise.resolve(null);
      }
    }),
    save: jest.fn((arg: UserEntity) => {
      return Promise.resolve(arg);
    }),
  };
  const mockEventRepository = {
    findOne: jest.fn((arg) => {
      const event = mockEvents.find((event) =>{
        if (arg.where.client && arg.where.eid){
          return event.client.cid == arg.where.client.cid && event.eid == arg.where.eid;
        }
        else if (arg.where.eid){
          return event.eid == arg.where.eid;
        }
        else{
          return false;
        }
      });
      if (event) {
        return Promise.resolve(event);
      } else {
        return Promise.resolve(null);
      }
    }),
  };
  const mockParticipantRepository = {
    findOne: jest.fn((arg) => {
      const participant = mockParticipants.find((participant) =>{
        if (arg.where.event && arg.where.user){
          return participant.event.eid == arg.where.event.eid && participant.user.pid == arg.where.user.pid;
        }
        else if (arg.where.id){
          return participant.id == arg.where.id;
        }
        else{
          return false;
        }
      });
      if (participant) {
        return Promise.resolve(participant);
      } else {
        return Promise.resolve(null);
      }
    }),
    save: jest.fn((arg: ParticipantEntity) => {
      return Promise.resolve(arg);
    }),
    delete: jest.fn((arg: ParticipantEntity) => {
      const participant = mockParticipants.find((participant) =>{
        return participant.id == arg.id;
      });
      if (participant) {
        return Promise.resolve(1);
      } else {
        return Promise.resolve(0);
      }
    }),
    find: jest.fn((arg) => {
      const participants = mockParticipants.filter((participant) =>{
        if (arg.where.event){
          return participant.event.eid == arg.where.event.eid;
        }
        else{
          return false;
        }
      });
      if (participants) {
        return Promise.resolve(participants);
      } else {
        return Promise.resolve(null);
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
        }
      ],
    }).compile();

    participantService = module.get<ParticipantsService>(ParticipantsService);

    jest.clearAllMocks(); // Clears the usage data of all mocks
    
  });

  // unit tests for the participant service
  it('should be defined', () => {
    expect(participantService).toBeDefined();
  });

  it('should inviteParticipant', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const eventId = mockEvents[0].eid;
    const user = {
      first_name: mockUsers[3].first_name,
      last_name: mockUsers[3].last_name,
      email: mockUsers[3].email,
    };
    await participantService.inviteParticipant(headers, eventId, user);
    expect(mockParticipantRepository.save).toBeCalledTimes(1);
  });

  it('should updateParticipant', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const eventId = mockEvents[0].eid;
    const pid = mockUsers[2].pid;
    const user = {
      first_name: randomString(),
      last_name: randomString(),
      email: randomEmail(),
    };
    const result = await participantService.updateParticipant(headers, eventId, pid, user);
    const expected = {
      pid: pid,
      client: mockClients[0],
      user_type: mockUsers[2].user_type,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    };
    expect(result).toEqual(expected);
  
  });

  it('should deleteParticipant', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const eid = mockEvents[0].eid;
    const pid = mockUsers[2].pid;
    await participantService.deleteParticipant(headers, pid, eid);
    expect(mockParticipantRepository.delete).toBeCalledTimes(1);
  });
  
  it('should listParticipants', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const eid = mockEvents[0].eid;
    const result = await participantService.listParticipants(headers, eid);
    expect(result).toEqual([mockParticipants[0]]);
  });

  it('should updateStatus', async () => {
    const eid = mockEvents[0].eid;
    const pid = mockUsers[2].pid;
    const status = 'accept';
    await participantService.updateStatus(pid, eid, status);
    expect(mockParticipantRepository.save).toBeCalledTimes(1);
    mockParticipants[0].status = "pending";
  });

  it('should sendEmailToAll', async () => {
    jest.spyOn(participantService, 'sendEmail').mockImplementation(async () => {});
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const eid = mockEvents[0].eid;
    await participantService.sendEmailToAllParticipants(headers, eid);
    expect(participantService.sendEmail).toBeCalledTimes(1);
  });

  // error handling
  it('inviteParticipant: should throw error when client token is not provided', async () => {
    const headers = {
      
    };
    const eventId = mockEvents[0].eid;
    const user = {
      first_name: mockUsers[3].first_name,
      last_name: mockUsers[3].last_name,
      email: mockUsers[3].email,
    };
    await expect(participantService.inviteParticipant(headers, eventId, user)).rejects.toThrow(HttpException);
  });

  it('inviteParticipant: should throw error when client token is invalid', async () => {
    const headers = {
      authorization: randomString(),
    };
    const eventId = mockEvents[0].eid;
    const user = {
      first_name: mockUsers[3].first_name,
      last_name: mockUsers[3].last_name,
      email: mockUsers[3].email,
    };
    await expect(participantService.inviteParticipant(headers, eventId, user)).rejects.toThrow(HttpException);
  });

  it('inviteParticipant: should throw not found error when event id is invalid', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const eventId = randomString();
    const user = {
      first_name: mockUsers[3].first_name,
      last_name: mockUsers[3].last_name,
      email: mockUsers[3].email,
    };
    await expect(participantService.inviteParticipant(headers, eventId, user)).rejects.toThrow(NotFoundException);
  });

  it('inviteParticipant: should throw not found error when user email is invalid', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const eventId = mockEvents[0].eid;
    const user = {
      first_name: mockUsers[3].first_name,
      last_name: mockUsers[3].last_name,
      email: randomEmail(),
    };
    await expect(participantService.inviteParticipant(headers, eventId, user)).rejects.toThrow(NotFoundException);
  });

  it('inviteParticipant: should throw error when user is already a participant', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const eventId = mockEvents[0].eid;
    const user = {
      first_name: mockUsers[2].first_name,
      last_name: mockUsers[2].last_name,
      email: mockUsers[2].email,
    };
    await expect(participantService.inviteParticipant(headers, eventId, user)).rejects.toThrow(ConflictException);
  });

  it('inviteParticipant: should throw InternalServerErrorException when database error occurs', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const eventId = mockEvents[0].eid;
    const user = {
      first_name: mockUsers[3].first_name,
      last_name: mockUsers[3].last_name,
      email: mockUsers[3].email,
    };
    jest.spyOn(mockParticipantRepository, 'save').mockImplementation(async () => {throw new Error()});
    await expect(participantService.inviteParticipant(headers, eventId, user)).rejects.toThrow(InternalServerErrorException);
  });

  it('updateParticipant: should throw error when client token is not provided', async () => {
    const headers = {
      
    };
    const eventId = mockEvents[0].eid;
    const pid = mockUsers[2].pid;
    const user = {
      first_name: randomString(),
      last_name: randomString(),
      email: randomEmail(),
    };
    await expect(participantService.updateParticipant(headers, eventId, pid, user)).rejects.toThrow(HttpException);
  });

  it('updateParticipant: should throw error when client token is invalid', async () => {
    const headers = {
      authorization: randomString(),
    };
    const eventId = mockEvents[0].eid;
    const pid = mockUsers[2].pid;
    const user = {
      first_name: randomString(),
      last_name: randomString(),
      email: randomEmail(),
    };
    await expect(participantService.updateParticipant(headers, eventId, pid, user)).rejects.toThrow(HttpException);
  });

  it('updateParticipant: should throw not found error when event id is invalid', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const eventId = randomString();
    const pid = mockUsers[2].pid;
    const user = {
      first_name: randomString(),
      last_name: randomString(),
      email: randomEmail(),
    };
    await expect(participantService.updateParticipant(headers, eventId, pid, user)).rejects.toThrow(NotFoundException);
  });

  it('updateParticipant: should throw not found error when participant id is invalid', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const eventId = mockEvents[0].eid;
    const pid = mockUsers[3].pid;
    const user = {
      first_name: randomString(),
      last_name: randomString(),
      email: randomEmail(),
    };
    await expect(participantService.updateParticipant(headers, eventId, pid, user)).rejects.toThrow(NotFoundException);
  });

  it('deleteParticipant: should throw error when client token is not provided', async () => {
    const headers = {
      
    };
    const pid = mockUsers[2].pid;
    const eid = mockEvents[0].eid;
    await expect(participantService.deleteParticipant(headers, pid, eid)).rejects.toThrow(HttpException);
  });

  it('deleteParticipant: should throw error when client token is invalid', async () => {
    const headers = {
      authorization: randomString(),
    };
    const pid = mockUsers[2].pid;
    const eid = mockEvents[0].eid;
    await expect(participantService.deleteParticipant(headers, pid, eid)).rejects.toThrow(HttpException);
  });

  it('listParticipants: should throw error when client token is not provided', async () => {
    const headers = {
      
    };
    const eid = mockEvents[0].eid;
    await expect(participantService.listParticipants(headers, eid)).rejects.toThrow(HttpException);
  });

  it('listParticipants: should throw error when client token is invalid', async () => {
    const headers = {
      authorization: randomString(),
    };
    const eid = mockEvents[0].eid;
    await expect(participantService.listParticipants(headers, eid)).rejects.toThrow(HttpException);
  });

  it('updateStatus: should throw error when event id is invalid', async () => {
    const eid = randomString();
    const pid = mockUsers[2].pid;
    const status = 'accept';
    await expect(participantService.updateStatus(pid, eid, status)).rejects.toThrow(NotFoundException);
  });

  it('updateStatus: should throw error when participant id is invalid', async () => {
    const eid = mockEvents[0].eid;
    const pid = randomString();
    const status = 'accept';
    await expect(participantService.updateStatus(pid, eid, status)).rejects.toThrow(NotFoundException);
  });

  it('sendEmailToAllParticipants: should throw error when client token is not provided', async () => {
    jest.spyOn(participantService, 'sendEmail').mockImplementation(async () => {});
    const headers = {
      
    };
    const eid = mockEvents[0].eid;
    await expect(participantService.sendEmailToAllParticipants(headers, eid)).rejects.toThrow(HttpException);
  });

  it('sendEmailToAllParticipants: should throw error when client token is invalid', async () => {
    jest.spyOn(participantService, 'sendEmail').mockImplementation(async () => {});
    const headers = {
      authorization: randomString(),
    };
    const eid = mockEvents[0].eid;
    await expect(participantService.sendEmailToAllParticipants(headers, eid)).rejects.toThrow(HttpException);
  });

  it('sendEmailToAllParticipants: should throw error when event id is invalid', async () => {
    jest.spyOn(participantService, 'sendEmail').mockImplementation(async () => {});
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const eid = randomString();
    await expect(participantService.sendEmailToAllParticipants(headers, eid)).rejects.toThrow(NotFoundException);
  });

  

});

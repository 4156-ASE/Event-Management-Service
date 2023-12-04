import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEntity } from './models/event.entity';
import { NotFoundException } from '@nestjs/common';
import { EventInterface } from './models/event.interface';
import { UserEntity } from '../../src/users/models/user.entity';
import { ClientEntity } from 'src/users/models/client.entity';
import { randomBytes, randomInt } from 'crypto';
import {
  createClient,
  createEvent,
  createUser,
  randomEmail,
  randomString,
} from '../test.util';
import { CreateEventDTO, UpdateEventDTO } from './models/event.dto';

describe('EventsService', () => {
  let service: EventsService;
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
    createEvent(mockClients[0], mockUsers[1]),
    createEvent(mockClients[0], mockUsers[2]),
    createEvent(mockClients[1], mockUsers[5]),
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
        let flag = true;
        if (arg.where.client){
          flag = flag && event.client.cid == arg.where.client.cid;
        }
        if (arg.where.host){
          flag = flag && event.host.pid == arg.where.host.pid;
        }
        if (arg.where.eid){
          flag = flag && event.eid == arg.where.eid;
        }
        return flag;
      });
      if (event) {
        return Promise.resolve(event);
      } else {
        return Promise.resolve(null);
      }
    }),
    find: jest.fn((arg) => {
      const events = mockEvents.filter((event) =>{
        let flag = true;
        if (arg.where.client){
          flag = flag && event.client.cid == arg.where.client.cid;
        }
        if (arg.where.host){
          flag = flag && event.host.pid == arg.where.host.pid;
        }
        
        return flag;
      });
      if (events) {
        return Promise.resolve(events);
      } else {
        return Promise.resolve(null);
      }
    }),
    update: jest.fn((arg1, arg2) => {
      return Promise.resolve();
    }),
    save: jest.fn((arg: EventEntity) => {
      return Promise.resolve(arg);
    }),
    delete: jest.fn((arg) => {
      return Promise.resolve(1);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(EventEntity),
          useValue: mockEventRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(ClientEntity),
          useValue: mockClientRepository,
        },
      ],
    }).compile();
    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a event', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const event: CreateEventDTO = {
      title: randomString(),
      desc: randomString(),
      start_time: new Date(),
      end_time: new Date(),
      location: randomString(),
      host: mockUsers[0].pid,
    };
    const result = await service.insertEvent(headers, event);
    // console.log("test", result);
    expect(result).toEqual({  // no eid
      host: mockUsers[0],
      client: mockClients[0],
      title: event.title,
      desc: event.desc,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location,
    });
  });

  it('should get all events', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const result = await service.getEvents(headers);
    expect(result).toEqual([mockEvents[0], mockEvents[1], mockEvents[2]]);
  });

  it('should get all events of a user', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const result = await service.getEventsByUser(headers, mockUsers[1].pid);
    expect(result).toEqual([mockEvents[0], mockEvents[1]]);
  });

  it('should get a event', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const result = await service.getEvent(headers, mockEvents[0].eid);
    expect(result).toEqual(mockEvents[0]);
  });
  
  it('should update a event', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const event: UpdateEventDTO = {
      title: randomString(),
      desc: randomString(),
      start_time: new Date(),
      end_time: new Date(),
      location: randomString(),
    };
    await service.updateEvent(headers, mockEvents[0].eid, event);
    expect(mockEventRepository.update).toHaveBeenCalledWith(
      { eid: mockEvents[0].eid },
      event,
    );
  });

  it('should delete a event', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    await service.deleteEvent(headers, mockEvents[0].eid);
    expect(mockEventRepository.findOne).toHaveBeenCalledWith({
      where: { eid: mockEvents[0].eid },
    });
    expect(mockEventRepository.delete).toHaveBeenCalledWith(
      mockEvents[0].eid
    );
  });


});

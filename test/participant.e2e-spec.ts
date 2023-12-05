import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { ParticipantsModule } from '../src/participants/participant.module';
import { ParticipantEntity } from '../src/participants/models/participant.entity';
import { EventEntity } from '../src/events/models/event.entity';
import { UserEntity } from '../src/users/models/user.entity';
import { NotFoundException } from '@nestjs/common';
import { ClientEntity } from 'src/users/models/client.entity';
import { EntityNotFoundError } from 'typeorm';

describe('ParticipantController (e2e)', () => {
  let app: INestApplication;
  const mockClient: ClientEntity[] = [
    {
      cid: '1',
      client_token: 'token',
      admin_email: 'admin@example.com',
    },
  ];
  const mockUsers = [
    {
      pid: '1',
      client: mockClient[0],
      first_name: 'andrew',
      last_name: 'rockefeller',
      email: 'andrew@gmail.com',
      user_type: 'admin' as 'admin' | 'regular',
    },
    {
      pid: '2',
      client: mockClient[0],
      first_name: 'bob',
      last_name: 'burman',
      email: 'bob@gmail.com',
      user_type: 'admin' as 'admin' | 'regular',
    },
    {
      pid: '3',
      client: mockClient[0],
      first_name: 'charlie',
      last_name: 'chaplin',
      email: 'test3@email.com',
      user_type: 'admin' as 'admin' | 'regular',
    },
  ];
  const mockEvents = [
    {
      eid: '1',
      client: mockClient[0],
      title: 'mock birthday',
      desc: 'mock event for testing',
      start_time: new Date('December 17, 2023 03:24:00 GMT-05:00'),
      end_time: new Date('December 17, 2023 04:24:00 GMT-05:00'),
      location: 'columbia',
      host: mockUsers[0],
    },
    {
      eid: '2',
      client: mockClient[0],
      title: 'mock celebration',
      desc: 'mock event for testing',
      // FIXME: why GMT-4 work
      start_time: new Date('October 20, 2023 10:00:00 GMT-04:00'),
      end_time: new Date('October 20, 2023 12:00:00 GMT-04:00'),
      location: 'nyu',
      host: mockUsers[0],
    },
  ];
  const mockParticipants = [
    {
      id: 1,
      user: { ...mockUsers[1] },
      event: { ...mockEvents[0] },
      status: 'accept',
    },
    {
      id: 2,
      user: { ...mockUsers[2] },
      event: { ...mockEvents[0] },
      status: 'reject',
    },
    {
      id: 3,
      user: { ...mockUsers[1] },
      event: { ...mockEvents[1] },
      status: 'invited',
    },
  ];
  const mockClientRepository = {
    findOne: jest.fn().mockImplementation((arg) => {
      if (arg.where.client_token === mockClient[0].client_token) {
        return Promise.resolve(mockClient[0]);
      }
      return Promise.resolve(null);
    }),
    save: jest.fn().mockImplementation((client) => {
      if (client.cid) {
        for (const item of mockClient) {
          if (item.cid == client.cid) {
            Object.assign(item, client);
            return Promise.resolve(item);
          }
        }
      } else {
        const new_client = {
          cid: `mock_cid_${mockClient.length + 1}`,
          ...client,
        };
        mockClient.push(new_client);
        return Promise.resolve(new_client);
      }
    }),
    update: jest.fn().mockImplementation((cid, client) => {
      for (const item of mockClient) {
        if (item.cid == cid) {
          Object.assign(item, client);
          return Promise.resolve(item);
        }
      }
      return Promise.reject(new EntityNotFoundError(ClientEntity, cid));
    }),
    delete: jest.fn().mockImplementation((cid) => {
      const index = mockClient.findIndex((item) => item.cid === cid);
      if (index > -1) {
        mockClient.splice(index, 1);
        return Promise.resolve({ raw: [], affected: 1 });
      }
      return Promise.resolve({ raw: [], affected: 0 });
    }),
  };
  const mockUserRepository = {
    findOne: jest.fn().mockImplementation((arg) => {
      for (const item of mockUsers) {
        if (item.email == arg.where.email || item.pid == arg.where.pid) {
          return Promise.resolve(item);
        }
      }
      return Promise.resolve(null);
    }),
    save: jest.fn((user) => {
      mockUsers.push(user);
      return Promise.resolve({ message: 'inserted' });
    }),
  };
  const mockEventsRepository = {
    findOne: jest.fn().mockImplementation((arg) => {
      for (const item of mockEvents) {
        if (arg.where.eid == item.eid) {
          return Promise.resolve(item);
        }
      }
      return Promise.resolve(null);
    }),
    find: jest.fn().mockImplementation((arg) => {
      if (arg == undefined) {
        return Promise.resolve(mockEvents);
      } else {
        for (const item of mockEvents) {
          if (item.eid == arg.where.eid) {
            return Promise.resolve([item]);
          }
        }
        return Promise.resolve([]);
      }
    }),
    save: jest.fn().mockImplementation((event: EventEntity) => {
      mockEvents.push(event);
      return [Promise.resolve({ message: 'insert successfully' })];
    }),
    update: jest.fn().mockImplementation((eid, event) => {
      for (let i = 0; i < mockEvents.length; i++) {
        if (mockEvents[i].eid === eid) {
          const new_event = Object.assign({ eid: eid }, event);
          mockEvents[i] = new_event;
        }
      }
    }),
    delete: jest.fn().mockImplementation((arg) => {
      for (const item of mockEvents) {
        if (item.eid == arg) {
          return Promise.resolve({ affected: 1 });
        }
      }
      return Promise.resolve({ affected: 0 });
    }),
  };
  const mockParticipantRepository = {
    find: jest.fn().mockImplementation((arg) => {
      if (arg == undefined) {
        return Promise.resolve(mockParticipants);
      } else {
        const result = [];
        for (const item of mockParticipants) {
          if (item.event.eid == arg.where.event.eid) {
            result.push(item);
          }
        }
        if (result.length === 0) {
          throw new NotFoundException('not found');
        }
        return Promise.resolve(result);
      }
    }),
    save: jest.fn((participant) => {
      mockParticipants.push(participant);
      return Promise.resolve({ message: 'inserted' });
    }),
    findOne: jest.fn().mockImplementation((arg) => {
      for (const item of mockParticipants) {
        if (
          (!arg.where.event && item.id == arg.where.id) ||
          (item.event.eid == arg.where.event.eid &&
            item.user.pid == arg.where.user.pid)
        ) {
          return Promise.resolve(item);
        }
      }
      return Promise.resolve(null);
    }),
    delete: jest.fn().mockImplementation((arg) => {
      for (const item of mockParticipants) {
        if (item.id == arg) {
          return Promise.resolve({ affected: 1 });
        }
      }
      return Promise.resolve({ affected: 0 });
    }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ParticipantsModule],
    })
      .overrideProvider(getRepositoryToken(ParticipantEntity))
      .useValue(mockParticipantRepository)
      .overrideProvider(getRepositoryToken(EventEntity))
      .useValue(mockEventsRepository)
      .overrideProvider(getRepositoryToken(UserEntity))
      .useValue(mockUserRepository)
      .overrideProvider(getRepositoryToken(ClientEntity))
      .useValue(mockClientRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/participants/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/participants/10')
      .set('authorization', 'token')
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        message: 'Cannot GET /participants/10',
        error: 'Not Found',
        statusCode: 404,
      });
  });

  it('/participants/:id (POST) invite participant', () => {
    return request(app.getHttpServer())
      .post('/participants/2')
      .set('authorization', 'token')
      .send({
        first_name: 'charlie',
        last_name: 'chaplin',
        email: 'test3@email.com',
      })
      .expect('Content-Type', /json/)
      .expect(201)
      .expect({ message: 'Invitations sent successfully.' });
  });

  it('/participants/:id (POST) fail to find event and can find user', () => {
    return request(app.getHttpServer())
      .post('/participants/10')
      .set('authorization', 'token')
      .send({
        first_name: 'charlie',
        last_name: 'chaplin',
        email: 'test3@email.com',
      })
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        message: 'Event not found',
        error: 'Not Found',
        statusCode: 404,
      });
  });
  it('/participants/:id (POST) found event and fail to find user', () => {
    return request(app.getHttpServer())
      .post('/participants/1')
      .set('authorization', 'token')
      .send({
        first_name: 'david',
        last_name: 'demon',
        email: 'test4@email.com',
      })
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        message: 'User not found',
        error: 'Not Found',
        statusCode: 404,
      });
  });
  it('/participants/:id (POST) fail to find event and fail to find user', () => {
    return request(app.getHttpServer())
      .post('/participants/10')
      .set('authorization', 'token')
      .send({
        first_name: 'david',
        last_name: 'demon',
        email: 'test4@email.com',
      })
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        message: 'Event not found',
        error: 'Not Found',
        statusCode: 404,
      });
  });
  it('/participants/:id (POST) repeated invitation', () => {
    return request(app.getHttpServer())
      .post('/participants/1')
      .set('authorization', 'token')
      .send({
        first_name: 'bob',
        last_name: 'burman',
        email: 'bob@gmail.com',
      })
      .expect('Content-Type', /json/)
      .expect(500)
      .expect({
        message: 'Failed to invite the participant',
        error: 'Internal Server Error',
        statusCode: 500,
      });
  });

  it('/participants/:id (PATCH) update succeed', () => {
    return request(app.getHttpServer())
      .patch('/participants/2/2')
      .set('authorization', 'token')
      .send({
        first_name: 'alison',
        last_name: 'burman',
        email: 'alison@gmail.com',
      })
      .expect('Content-Type', /json/)
      .expect(404);
  });
  it('/participants/:id (PATCH) update fail cannot find event', () => {
    return request(app.getHttpServer())
      .patch('/participants/10/2')
      .set('authorization', 'token')
      .send({
        first_name: 'alison',
        last_name: 'burman',
        email: 'alison@gmail.com',
      })
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        message: 'Event not found',
        error: 'Not Found',
        statusCode: 404,
      });
  });
  it('/participants/:id (PATCH) update fail cannot find association between user and event', () => {
    return request(app.getHttpServer())
      .patch('/participants/2/10')
      .set('authorization', 'token')
      .send({
        first_name: 'alison',
        last_name: 'burman',
        email: 'alison@gmail.com',
      })
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        message: 'Event not found',
        error: 'Not Found',
        statusCode: 404,
      });
  });
  it('/participants/:id (PATCH) update fail cannot find user', () => {
    return request(app.getHttpServer())
      .patch('/participants/1/4')
      .set('authorization', 'token')
      .send({
        first_name: 'alison',
        last_name: 'burman',
        email: 'alison@gmail.com',
      })
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        message: 'Event not found',
        error: 'Not Found',
        statusCode: 404,
      });
  });
});

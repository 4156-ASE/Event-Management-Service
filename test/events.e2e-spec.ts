import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { EventsModule } from '../src/events/events.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEntity } from '../src/events/models/event.entity';
import { UserEntity } from '../src/users/models/user.entity';
import { ClientEntity } from 'src/users/models/client.entity';
import { EntityNotFoundError } from 'typeorm';

import * as moduleAlias from 'module-alias';

function initAlias() {
  moduleAlias.addAliases({
    '@/(.*)': '<rootDit>/$1',
  });
}

initAlias();

describe('EventsController (e2e)', () => {
  let app: INestApplication;
  const mockClient: ClientEntity[] = [
    {
      cid: '1',
      client_token: 'token',
      admin_email: 'admin@example.com',
    },
  ];
  const mockUsers: UserEntity[] = [
    {
      pid: '1',
      client: mockClient[0],
      first_name: 'andrew',
      last_name: 'rockefeller',
      email: 'andrew@gmail.com',
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

  const mockEvent1 = {
    eid: '1',
    client: mockClient[0],
    title: 'mock birthday',
    desc: 'mock event for testing',
    start_time: '2023-12-17T08:24:00.000Z',
    end_time: '2023-12-17T09:24:00.000Z',
    location: 'columbia',
    host: mockUsers[0],
  };
  const mockEvent2 = {
    eid: '2',
    client: mockClient[0],
    title: 'mock celebration',
    desc: 'mock event for testing',
    start_time: '2023-10-20T14:00:00.000Z',
    end_time: '2023-10-20T16:00:00.000Z',
    location: 'nyu',
    host: mockUsers[0],
  };
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
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EventsModule],
    })
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

  it('/events/ (POST)', () => {
    return request(app.getHttpServer())
      .post('/events')
      .set('authorization', 'token')
      .send({
        eid: '3',
        client: mockClient[0],
        title: 'mock party',
        desc: 'mock event for testing',
        start_time: new Date('November 17, 2023 16:00:00 GMT-05:00'),
        end_time: new Date('November 17, 2023 19:00:00 GMT-05:00'),
        location: 'columbia',
        host: '1',
      })
      .expect('Content-Type', /json/)
      .expect(201)
      .then((response) => {
        expect(response.body).toEqual([{}]);
      });
  });

  it('/events/ (POST) fail to create if no user is found', () => {
    return request(app.getHttpServer())
      .post('/events')
      .set('authorization', 'token')
      .send({
        eid: '3',
        client: mockClient[0],
        title: 'mock party',
        desc: 'mock event for testing',
        start_time: new Date('November 17, 2023 16:00:00 GMT-05:00'),
        end_time: new Date('November 17, 2023 19:00:00 GMT-05:00'),
        location: 'columbia',
        host: '100',
      })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual({
          message: 'Host not found in user database',
          statusCode: 400,
        });
      });
  });

  it('/events (GET) get all events', () => {
    return request(app.getHttpServer())
      .get('/events')
      .set('authorization', 'token')
      .expect('Content-Type', /json/)
      .expect(200);
  });

  it('/events/:id1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/events/1')
      .set('authorization', 'token')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(mockEvent1);
  });

  it('/events/:id2 (GET)', () => {
    return request(app.getHttpServer())
      .get('/events/2')
      .set('authorization', 'token')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(mockEvent2);
  });

  it('/events/:id fail (GET)', () => {
    return request(app.getHttpServer())
      .get('/events/10')
      .set('authorization', 'token')
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        message: 'Event Not Found.',
        error: 'Not Found',
        statusCode: 404,
      });
  });

  it('/events/ (PATCH)', () => {
    return request(app.getHttpServer())
      .patch('/events/1')
      .set('authorization', 'token')
      .send({
        title: 'mock birthday 2',
        desc: 'mock event for testing update',
        start_time: new Date('November 17, 2023 16:00:00 GMT-05:00'),
        end_time: new Date('November 17, 2023 19:00:00 GMT-05:00'),
        location: 'columbia',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          message: 'Event updated successfully',
          status: 200,
        });
      });
  });

  it('/events/ (PATCH) update something that does not exist', () => {
    return request(app.getHttpServer())
      .patch('/events/10')
      .set('authorization', 'token')
      .send({
        title: 'mock birthday 2',
        desc: 'mock event for testing update',
        start_time: new Date('November 17, 2023 16:00:00'),
        end_time: new Date('November 17, 2023 19:00:00'),
        location: 'columbia',
      })
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        message: 'Event Not Found.',
        error: 'Not Found',
        statusCode: 404,
      });
  });

  it('/events/:id fail (GET) nothing should update to events with id 10', () => {
    return request(app.getHttpServer())
      .get('/events/10')
      .set('authorization', 'token')
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        message: 'Event Not Found.',
        error: 'Not Found',
        statusCode: 404,
      });
  });

  it('/events/:id10 (DELETE) should ignore with no found id', () => {
    return request(app.getHttpServer())
      .delete('/events/10')
      .set('authorization', 'token')
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        message: 'Event Not Found.',
        error: 'Not Found',
        statusCode: 404,
      });
  });

  it('/events/:id2 (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/events/1')
      .set('authorization', 'token')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({ status: 200, message: 'Event deleted successfully' });
  });
});

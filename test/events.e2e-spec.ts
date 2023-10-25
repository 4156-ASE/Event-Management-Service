import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { EventsModule } from '../src/events/events.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEntity } from '../src/events/models/event.entity';
import { EventInterface } from 'src/events/models/event.interface';
import { UserEntity } from 'src/users/models/user.entity';

describe('EventsController (e2e)', () => {
  let app: INestApplication;
  let mockUsers = [
    {
      id: 1,
      first_name: 'andrew',
      last_name: 'rockefeller',
      email: 'andrew@gmail.com',
      password: '123456',
    },
  ];
  let mockEvents = [
    {
      id: '1',
      title: 'mock birthday',
      desc: 'mock event for testing',
      start_time: new Date('December 17, 2023 03:24:00'),
      end_time: new Date('December 17, 2023 04:24:00'),
      location: 'columbia',
      host: 1,
    },
    {
      id: '2',
      title: 'mock celebration',
      desc: 'mock event for testing',
      start_time: new Date('October 20, 2023 10:00:00'),
      end_time: new Date('October 20, 2023 12:00:00'),
      location: 'nyu',
      host: 1,
    },
  ];

  const mockEvent1 = {
    id: '1',
    title: 'mock birthday',
    desc: 'mock event for testing',
    start_time: '2023-12-17T08:24:00.000Z',
    end_time: '2023-12-17T09:24:00.000Z',
    location: 'columbia',
    host: 1,
  };
  const mockEvent2 = {
    id: '2',
    title: 'mock celebration',
    desc: 'mock event for testing',
    start_time: '2023-10-20T14:00:00.000Z',
    end_time: '2023-10-20T16:00:00.000Z',
    location: 'nyu',
    host: 1,
  };
  const mockEvent3 = {
    id: '3',
    title: 'mock party',
    desc: 'mock event for testing',
    start_time: '2023-11-17T21:00:00.000Z',
    end_time: '2023-11-18T00:00:00.000Z',
    location: 'columbia',
    host: 1,
  };
  const mockUserRepository = {
    findOne: jest.fn().mockImplementation((arg) => {
      for (const item of mockUsers) {
        if (item.email == arg.where.email || item.id == arg.where.id) {
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
    find: jest.fn().mockImplementation((arg) => {
      if (arg == undefined) {
        return Promise.resolve(mockEvents);
      } else {
        for (const item of mockEvents) {
          if (item.id == arg.where.id) {
            return Promise.resolve([item]);
          }
        }
        return Promise.resolve([]);
      }
    }),
    save: jest.fn().mockImplementation((event: EventInterface) => {
      mockEvents.push(event);
      return [Promise.resolve({ message: 'insert successfully' })];
    }),
    update: jest.fn().mockImplementation((id, event) => {
      for (let i = 0; i < mockEvents.length; i++) {
        if (mockEvents[i].id === id) {
          const new_event = Object.assign({ id: id }, event);
          mockEvents[i] = new_event;
        }
      }
    }),
    delete: jest.fn().mockImplementation((arg) => {
      for (const item of mockEvents) {
        if (item.id == arg) {
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
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/events/ (POST)', () => {
    return request(app.getHttpServer())
      .post('/events')
      .send({
        id: '3',
        title: 'mock party',
        desc: 'mock event for testing',
        start_time: new Date('November 17, 2023 16:00:00'),
        end_time: new Date('November 17, 2023 19:00:00'),
        location: 'columbia',
        host: 1,
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
      .send({
        id: '3',
        title: 'mock party',
        desc: 'mock event for testing',
        start_time: new Date('November 17, 2023 16:00:00'),
        end_time: new Date('November 17, 2023 19:00:00'),
        location: 'columbia',
        host: 2,
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
      .expect('Content-Type', /json/)
      .expect(200)
      .expect([mockEvent1, mockEvent2, mockEvent3]);
  });

  it('/events/:id1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/events/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(mockEvent1);
  });

  it('/events/:id2 (GET)', () => {
    return request(app.getHttpServer())
      .get('/events/2')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(mockEvent2);
  });

  it('/events/:id fail (GET)', () => {
    return request(app.getHttpServer())
      .get('/events/10')
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
      .send({
        title: 'mock birthday 2',
        desc: 'mock event for testing update',
        start_time: new Date('November 17, 2023 16:00:00'),
        end_time: new Date('November 17, 2023 19:00:00'),
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
        message: 'Could not find event: 10.',
        error: 'Not Found',
        statusCode: 404,
      });
  });

  it('/events/:id fail (GET) nothing should update to events with id 10', () => {
    return request(app.getHttpServer())
      .get('/events/10')
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
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        message: 'Event with ID 10 not found.',
        error: 'Not Found',
        statusCode: 404,
      });
  });

  it('/events/:id2 (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/events/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({ status: 200, message: 'Event deleted successfully' });
  });
});

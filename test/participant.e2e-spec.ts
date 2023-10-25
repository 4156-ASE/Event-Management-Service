import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { ParticipantsModule } from '../src/participants/participant.module';
import { ParticipantEntity } from '../src/participants/models/participant.entity';
import { EventEntity } from '../src/events/models/event.entity';
import { UserEntity } from '../src/users/models/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('ParticipantController (e2e)', () => {
  let app: INestApplication;
  let mockUsers = [
    {
      id: 1,
      first_name: 'andrew',
      last_name: 'rockefeller',
      email: 'andrew@gmail.com',
      password: '123456',
    },
    {
      id: 2,
      first_name: 'bob',
      last_name: 'burman',
      email: 'bob@gmail.com',
      password: '123456',
    },
    {
      id: 3,
      first_name: 'charlie',
      last_name: 'chaplin',
      email: 'test3@email.com',
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
  let mockParticipants = [
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
    {
      id: 4,
      user: {
        id: 4,
        first_name: 'andrew',
        last_name: 'rockefeller',
        email: 'cat@gmail.com',
        password: '123456',
      },
      event: { ...mockEvents[0] },
      status: 'invited',
    },
  ];
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
  const mockEventRepository = {
    findOne: jest.fn().mockImplementation((arg) => {
      for (const item of mockEvents) {
        if (item.id == arg.where.id) {
          return Promise.resolve(item);
        }
      }
      return Promise.resolve(null);
    }),
  };
  const mockParticipantRepository = {
    find: jest.fn().mockImplementation((arg) => {
      if (arg == undefined) {
        return Promise.resolve(mockParticipants);
      } else {
        const result = [];
        for (const item of mockParticipants) {
          if (item.event.id == arg.where.event.id) {
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
          (item.event.id == arg.where.event.id &&
            item.user.id == arg.where.user.id)
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
      .useValue(mockEventRepository)
      .overrideProvider(getRepositoryToken(UserEntity))
      .useValue(mockUserRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  it('/participants/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/participants/2')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect([
        {
          pid: 3,
          first_name: 'bob',
          last_name: 'burman',
          email: 'bob@gmail.com',
          status: 'invited',
        },
      ]);
  });
  it('/participants/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/participants/10')
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({ message: 'not found', error: 'Not Found', statusCode: 404 });
  });

  it('/participants/:id (POST) invite participant', () => {
    return request(app.getHttpServer())
      .post('/participants/2')
      .send({
        first_name: 'charlie',
        last_name: 'chaplin',
        email: 'test3@email.com',
      })
      .expect('Content-Type', /json/)
      .expect(201)
      .expect({ message: 'Invitations sent successfully.' });
  });
  it('/participants/:id (GET) check if invite participant is working', () => {
    return request(app.getHttpServer())
      .get('/participants/2')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect([
        {
          pid: 3,
          first_name: 'bob',
          last_name: 'burman',
          email: 'bob@gmail.com',
          status: 'invited',
        },
        {
          first_name: 'charlie',
          last_name: 'chaplin',
          email: 'test3@email.com',
          status: 'invited',
        },
      ]);
  });
  it('/participants/:id (POST) fail to find event and can find user', () => {
    return request(app.getHttpServer())
      .post('/participants/10')
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
      .send({
        first_name: 'alison',
        last_name: 'burman',
        email: 'alison@gmail.com',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({});
  });
  it('/participants/:id (PATCH) update fail cannot find event', () => {
    return request(app.getHttpServer())
      .patch('/participants/10/2')
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
      .send({
        first_name: 'alison',
        last_name: 'burman',
        email: 'alison@gmail.com',
      })
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        message: 'Participant not associated with this event',
        error: 'Not Found',
        statusCode: 404,
      });
  });
  it('/participants/:id (PATCH) update fail cannot find user', () => {
    return request(app.getHttpServer())
      .patch('/participants/1/4')
      .send({
        first_name: 'alison',
        last_name: 'burman',
        email: 'alison@gmail.com',
      })
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        message: 'User not found',
        error: 'Not Found',
        statusCode: 404,
      });
  });
  it('/participants/:id (DELETE) delete success', () => {
    return request(app.getHttpServer())
      .delete('/participants/3')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({ message: 'Participant deleted successfully' });
  });

  it('/participants/:id (DELETE) delete fail', () => {
    return request(app.getHttpServer())
      .delete('/participants/10')
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        message: 'Participant not found',
        error: 'Not Found',
        statusCode: 404,
      });
  });

  it('/participants/respond (PATCH) update status succeed', () => {
    return request(app.getHttpServer())
      .patch('/participants/respond')
      .send({ pid: 1, status: 'accept' })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
        message:
          'Thank you for your response. We look forward to your participation!',
      });
  });

  it('/participants/respond (PATCH) update status succeed', () => {
    return request(app.getHttpServer())
      .patch('/participants/respond')
      .send({ pid: 10, status: 'accept' })
      .expect('Content-Type', /json/)
      .expect(500)
      .expect({
        message: 'Failed to update the status',
        error: 'Internal Server Error',
        statusCode: 500,
      });
  });
});

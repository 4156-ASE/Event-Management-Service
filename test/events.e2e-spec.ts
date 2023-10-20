import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { EventsModule } from '../src/events/events.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEntity } from '../src/events/models/event.entity';

describe('EventsController (e2e)', () => {
  let app: INestApplication;
  const mockEvents = [
    {
      id: '1',
      title: 'mock birthday',
      desc: 'mock event for testing',
      start_time: new Date('December 17, 2023 03:24:00'),
      end_time: new Date('December 17, 2023 04:24:00'),
      location: 'columbia',
    },
    {
      id: '2',
      title: 'mock celebration',
      desc: 'mock event for testing',
      start_time: new Date('October 20, 2023 10:00:00'),
      end_time: new Date('October 20, 2023 12:00:00'),
      location: 'nyu',
    },
  ];

  const mockEvent1 = {
    id: '1',
    title: 'mock birthday',
    desc: 'mock event for testing',
    start_time: '2023-12-17T08:24:00.000Z',
    end_time: '2023-12-17T09:24:00.000Z',
    location: 'columbia',
  };
  const mockEvent2 = {
    id: '2',
    title: 'mock celebration',
    desc: 'mock event for testing',
    start_time: '2023-10-20T14:00:00.000Z',
    end_time: '2023-10-20T16:00:00.000Z',
    location: 'nyu',
  };
  const mockEvent3 = {
    id: '3',
    title: 'mock party',
    desc: 'mock event for testing',
    start_time: '2023-11-17T21:00:00.000Z',
    end_time: '2023-11-18T00:00:00.000Z',
    location: 'columbia',
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
    save: jest.fn().mockImplementation((event) => {

      mockEvents.push(event);
      return [Promise.resolve({ message: 'insert successfully' })];
    }),
  };
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EventsModule],
    })
      .overrideProvider(getRepositoryToken(EventEntity))
      .useValue(mockEventsRepository)
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
      })
      .expect('Content-Type', /json/)
      .expect(201)
      .then((response) => {
        expect(response.body).toEqual({
          message: 'insert successfully',
        });
      });
  });

  it('/events (GET)', () => {
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
});

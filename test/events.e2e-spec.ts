import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { EventsModule } from '../src/events/events.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEntity } from '../src/events/models/event.entity';
import { EventsService } from '../src/events/events.service';

import * as moduleAlias from 'module-alias';

function initAlias() {
  moduleAlias.addAliases({
    '@/(.*)': '<rootDit>/$1',
  });
}

initAlias();

describe('EventsController (e2e)', () => {
  let app: INestApplication;
  const mockEventsRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
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
    const eventsService = moduleFixture.get<EventsService>(EventsService);
    jest
      .spyOn(eventsService, 'sendEmail')
      .mockImplementation(() => Promise.resolve());
  });

  it('/events (GET)', () => {
    const mockEvents = [
      {
        eid: 'test-eid',
        title: 'test',
        desc: 'test',
        start_time: new Date('2021-01-01T00:00:00.000Z'),
        end_time: new Date('2021-01-01T00:00:00.000Z'),
        location: 'test',
        host: 'test',
        participants: ['test'],
        host_email: undefined,
        participants_email: undefined,
        host_name: undefined,
        participants_name: undefined,
      },
    ];
    mockEventsRepository.find.mockResolvedValue(mockEvents);
    return request(app.getHttpServer())
      .get('/events')
      .expect(200)
      .expect(
        mockEvents.map((event) => ({
          id: event.eid,
          title: event.title,
          desc: event.desc,
          start_time: event.start_time.toISOString(),
          end_time: event.end_time.toISOString(),
          location: event.location,
          host: event.host,
          participants: event.participants,
        })),
      );
  });

  it('/events (POST)', () => {
    const mockEvent = {
      eid: 'test-eid',
      title: 'test',
      desc: 'test',
      start_time: new Date('2021-01-01T00:00:00.000Z'),
      end_time: new Date('2021-01-01T00:00:00.000Z'),
      location: 'test',
      host: 'test',
      participants: ['test'],
      host_email: undefined,
      participants_email: undefined,
      host_name: undefined,
      participants_name: undefined,
    };
    mockEventsRepository.save.mockResolvedValue(mockEvent);
    const createEventData = {
      title: 'test',
      desc: 'test',
      start_time: '2021-01-01T00:00:00.000Z',
      end_time: '2021-01-01T00:00:00.000Z',
      location: 'test',
      host: 'test',
      participants: ['test'],
      host_email: undefined,
      participants_email: undefined,
      host_name: undefined,
      participants_name: undefined,
    };
    return request(app.getHttpServer())
      .post('/events')
      .send(createEventData)
      .set('cid', 'test')
      .expect(201);
  });

  it('/events/:id (GET)', () => {
    const mockEvent = {
      eid: 'test-eid',
      title: 'test',
      desc: 'test',
      start_time: new Date('2021-01-01T00:00:00.000Z'),
      end_time: new Date('2021-01-01T00:00:00.000Z'),
      location: 'test',
      host: 'test',
      participants: ['test'],
      host_email: undefined,
      participants_email: undefined,
      host_name: undefined,
      participants_name: undefined,
    };
    mockEventsRepository.findOne.mockResolvedValue(mockEvent);

    return request(app.getHttpServer())
      .get('/events/event1')
      .expect(200)
      .expect({
        id: mockEvent.eid,
        title: mockEvent.title,
        desc: mockEvent.desc,
        start_time: mockEvent.start_time.toISOString(),
        end_time: mockEvent.end_time.toISOString(),
        location: mockEvent.location,
        host: mockEvent.host,
        participants: mockEvent.participants,
      });
  });

  it('/events/:id (PATCH)', () => {
    const updatePayload = {
      title: 'Updated Event',
      desc: 'Updated Description',
    };

    const updatedEvent = {
      eid: 'test-eid',
      ...updatePayload,
      start_time: new Date('2021-01-01T00:00:00.000Z'),
      end_time: new Date('2021-01-01T00:00:00.000Z'),
      location: 'test',
      host: 'test',
      participants: ['test'],
      host_email: undefined,
      participants_email: undefined,
      host_name: undefined,
      participants_name: undefined,
    };

    mockEventsRepository.update.mockResolvedValue({ affected: 1 });
    mockEventsRepository.findOne.mockResolvedValue(updatedEvent);

    return request(app.getHttpServer())
      .patch('/events/event1')
      .send(updatePayload)
      .expect(200)
      .expect({
        id: updatedEvent.eid,
        title: updatedEvent.title,
        desc: updatedEvent.desc,
        start_time: updatedEvent.start_time.toISOString(),
        end_time: updatedEvent.end_time.toISOString(),
        location: updatedEvent.location,
        host: updatedEvent.host,
        participants: updatedEvent.participants,
      });
  });

  it('/events/:id (DELETE)', () => {
    mockEventsRepository.delete.mockResolvedValue({ affected: 1 });

    return request(app.getHttpServer()).delete('/events/event1').expect(200);
  });
});

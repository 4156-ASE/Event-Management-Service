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
    mockEventsRepository.find.mockResolvedValue([]);
    return request(app.getHttpServer()).get('/events').expect(200).expect([]);
  });
});

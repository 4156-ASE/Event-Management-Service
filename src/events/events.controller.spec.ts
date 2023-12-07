import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Request } from 'express';
import { EventCreateReq } from './models/event.dto';

describe('EventsController', () => {
  let controller: EventsController;
  const sampleEvent = {
    title: 'test',
    desc: 'test',
    start_time: '2021-01-01T00:00:00.000Z',
    end_time: '2021-01-01T00:00:00.000Z',
    location: 'test',
    host: 'test',
    participants: ['test'],
    id: 'test',
    cid: 'test',
  };

  const mockEventsService = {
    insertEvent: jest.fn(),
    getEvents: jest.fn(),
    getEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: mockEventsService }],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an event', async () => {
    const req = { client: { cid: 'test' } } as Request;
    const body: EventCreateReq = {
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
    const result = { ...body, id: 'test', cid: 'test' };
    mockEventsService.insertEvent.mockResolvedValue(result);

    expect(await controller.createEvent(req, body)).toBe(result);
  });

  it('should get events', async () => {
    const req = { client: { cid: 'test' } } as Request;
    const result = [sampleEvent];
    mockEventsService.getEvents.mockResolvedValue(result);

    expect(await controller.getEvents({ pid: 'test' }, req)).toBe(result);
  });

  it('should get an event', async () => {
    const req = { client: { cid: 'test' } } as Request;
    const result = sampleEvent;
    mockEventsService.getEvent.mockResolvedValue(result);

    expect(await controller.getEvent('test', req)).toBe(result);
  });

  it('should update an event', async () => {
    const req = { client: { cid: 'test' } } as Request;
    const body: EventCreateReq = {
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
    const result = sampleEvent;
    mockEventsService.updateEvent.mockResolvedValue(result);

    expect(await controller.updateEvent(req, 'test', body)).toBe(result);
  });

  it('should remove an event', async () => {
    const req = { client: { cid: 'test' } } as Request;
    const result = sampleEvent;
    mockEventsService.deleteEvent.mockResolvedValue(result);

    expect(await controller.removeEvent(req, 'test')).toBe(result);
  });
});

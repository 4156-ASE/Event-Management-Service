import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { of } from 'rxjs';

describe('EventsController', () => {
  let eventsController: EventsController;
  const mockEventsService = {
    insertEvent: jest.fn((event) => {
      return {
        message: 'event created',
        ...event,
      };
    }),
    getEvent: jest.fn((eventID) => {
      return of([
        {
          id: eventID,
          message: 'event found',
        },
      ]);
    }),
    getEvents: jest.fn(() => {
      return {
        message: 'all events listed',
      };
    }),
    updateEvent: jest.fn().mockImplementation((eventId, event) => ({
      eventId,
      ...event,
    })),
    deleteEvent: jest.fn().mockImplementation((eventId) => ({
      eventId,
    })),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [EventsService],
    })
      .overrideProvider(EventsService)
      .useValue(mockEventsService)
      .compile();

    eventsController = app.get<EventsController>(EventsController);
  });

  it('should create an event', () => {
    expect(
      eventsController.createEvent({
        id: 'aaaa',
        title: 'aaaa',
        desc: 'aaa',
        start_time: new Date('December 17, 1995 03:24:00'),
        end_time: new Date('December 17, 1995 03:24:00'),
        location: 'aaaa',
      }),
    ).toStrictEqual({
      message: 'event created',
      desc: 'aaa',
      end_time: new Date('December 17, 1995 03:24:00'),
      id: 'aaaa',
      location: 'aaaa',
      start_time: new Date('December 17, 1995 03:24:00'),
      title: 'aaaa',
    });
  });

  it('should get all events', () => {
    expect(eventsController.getAllEvents()).toStrictEqual({
      message: 'all events listed',
    });
  });

  it('should get specific event', () => {
    eventsController.getEvent('aaaa').subscribe((data) => {
      expect(data).toEqual([{ id: 'aaaa', message: 'event found' }]);
    });
  });

  it('should update event', () => {
    const event = {
      id: 'aaaa',
      title: 'bbbb',
      desc: 'aaa',
      start_time: new Date('December 17, 2023 03:24:00'),
      end_time: new Date('December 17, 2023 03:24:00'),
      location: 'aaaa',
    };
    expect(eventsController.updateEvent('aaaa', event)).toEqual({ ok: true });
  });

  it('should delete event', () => {
    expect(eventsController.removeEvent('aaaa')).toEqual({ ok: true });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventEntity } from './models/event.entity';
import { EventInterface } from './models/event.interface';
import { CreateEventDTO, UpdateEventDTO } from './models/event.dto';
import { of } from 'rxjs';
import { ClientEntity } from 'src/users/models/client.entity';
import { UserEntity } from 'src/users/models/user.entity';
import { ParticipantEntity } from 'src/participants/models/participant.entity';
import { randomBytes, randomInt } from 'crypto';
import {
  createClient,
  createEvent,
  createParticipant,
  createUser,
  randomEmail,
  randomString,
} from '../test.util';
import { mock } from 'node:test';

describe('EventsController', () => {
  let eventsController: EventsController;
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
    createEvent(mockClients[1], mockUsers[5]),
  ];
  const mockParticipants: ParticipantEntity[] = [
    createParticipant(mockUsers[2], mockEvents[0], 'pending'),
    createParticipant(mockUsers[6], mockEvents[1], 'accept'),
  ];

  const mockEventsService = {
    insertEvent: jest.fn((event) => {
      return {
        eid: '1',
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
    getEventsByUser: jest.fn((headers, userPID) => {
      return [];
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

  it('should be defined', () => {
    expect(eventsController).toBeDefined();
  });

  it('should create a event', async () => {
    // check client token
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const event: CreateEventDTO = {
      title: randomString(),
      desc: randomString(),
      start_time: new Date("December 17, 2023 03:24:00"),
      end_time: new Date("December 17, 2023 04:24:00"),
      location: randomString(),
      host: mockUsers[0].pid,
    };
    const result = await eventsController.createEvent(headers, event);
    expect(mockEventsService.insertEvent).toHaveBeenCalledWith(headers, event);
  });

  it('should get all events', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const result = await eventsController.getAllEvents(headers);
    expect(mockEventsService.getEvents).toHaveBeenCalledWith(headers);
  });

  it('should get all events of a user', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const result = await eventsController.getEventsByUser(
      headers,
      mockUsers[1].pid,
    );
    expect(mockEventsService.getEventsByUser).toHaveBeenCalledWith(headers, mockUsers[1].pid);
  });

  it('should get a event', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const result = await eventsController.getEvent(headers, mockEvents[0].eid);
    expect(mockEventsService.getEvent).toHaveBeenCalledWith(
      headers,
      mockEvents[0].eid,
    );
  });

  it('should update a event', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const event: UpdateEventDTO = {
      title: randomString(),
      desc: randomString(),
      start_time: new Date("December 17, 2023 03:24:00"),
      end_time: new Date("December 17, 2023 04:24:00"),
      location: randomString(),
    };
    const result = await eventsController.updateEvent(
      headers,
      mockEvents[0].eid,
      event,
    );
    expect(mockEventsService.updateEvent).toHaveBeenCalledWith(
      headers,
      mockEvents[0].eid,
      event,
    );
  });

  it('should delete a event', async () => {
    const headers = {
      authorization: mockClients[0].client_token,
    };
    const result = await eventsController.removeEvent(
      headers,
      mockEvents[0].eid,
    );
    expect(mockEventsService.deleteEvent).toHaveBeenCalledWith(
      headers,
      mockEvents[0].eid,
    );
  });

});

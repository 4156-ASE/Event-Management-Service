import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEntity } from './models/event.entity';
import { NotFoundException } from '@nestjs/common';
import { EventInterface } from './models/event.interface';
import { UserEntity } from '../../src/users/models/user.entity';

describe('EventsService', () => {
  let service: EventsService;
  const mockEvents = [
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
  const mockUsers = [
    {
      id: 1,
      first_name: 'andrew',
      last_name: 'rockefeller',
      email: 'andrew@gmail.com',
      password: '123456',
    },
  ];
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
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(EventEntity),
          useValue: mockEventsRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();
    service = module.get<EventsService>(EventsService);
  });

  it('should insert event', async () => {
    const event = {
      title: 'bbbb',
      desc: 'aaa',
      start_time: new Date('December 17, 2023 03:24:00'),
      end_time: new Date('December 17, 2023 03:24:00'),
      location: 'aaaa',
      host: 1,
    };
    expect(await service.insertEvent(event)).toEqual([Promise.resolve({})]);
  });

  it('should find all events', async () => {
    service.getEvents().subscribe((data) => {
      expect(data).toEqual([
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
        {
          title: 'bbbb',
          desc: 'aaa',
          start_time: new Date('December 17, 2023 03:24:00'),
          end_time: new Date('December 17, 2023 03:24:00'),
          location: 'aaaa',
          host: 1,
        },
      ]);
    });
  });

  it('should return desired event', async () => {
    expect(await service.getEvent('1')).toEqual({
      desc: 'mock event for testing',
      end_time: new Date('December 17, 2023 04:24:00'),
      host: 1,
      id: '1',
      location: 'columbia',
      start_time: new Date('December 17, 2023 03:24:00'),
      title: 'mock birthday',
    });
  });

  it('should throw error when input id is not found', async () => {
    let throw_error = false;
    try {
      await service.getEvent('bbbb');
    } catch (error) {
      throw_error = true;
      expect(error).toBeInstanceOf(NotFoundException);
      expect((error as NotFoundException).getResponse()).toEqual({
        message: 'Event Not Found.',
        error: 'Not Found',
        statusCode: 404,
      });
    }
    expect(throw_error).toBe(true);
  });
  it('should update event with id match the given event id', async () => {
    const event = {
      title: 'cccc',
      desc: 'aaa',
      start_time: new Date('December 17, 2023 03:24:00'),
      end_time: new Date('December 17, 2023 03:24:00'),
      location: 'aaaa',
    };
    await service.updateEvent('1', event);
    expect(mockEventsRepository.update).toHaveBeenCalled();
  });

  it('should throw error when input id is not found when updating', async () => {
    let throw_error = false;
    const event = {
      title: 'cccc',
      desc: 'aaa',
      start_time: new Date('December 17, 2023 03:24:00'),
      end_time: new Date('December 17, 2023 03:24:00'),
      location: 'aaaa',
    };
    try {
      await service.updateEvent('cccc', event);
    } catch (error) {
      throw_error = true;
      expect(error).toBeInstanceOf(NotFoundException);
      expect((error as NotFoundException).getResponse()).toEqual({
        message: 'Could not find event: cccc.',
        error: 'Not Found',
        statusCode: 404,
      });
    }
    expect(throw_error).toBe(true);
  });

  it('should delete event', async () => {
    await service.deleteEvent('1');
    expect(mockEventsRepository.delete).toHaveBeenCalled();
  });
  it('should throw error when input id is not found when deleting', async () => {
    let throw_error = false;
    try {
      await service.deleteEvent('cccc');
    } catch (error) {
      throw_error = true;
      expect(error).toBeInstanceOf(NotFoundException);
      expect((error as NotFoundException).getResponse()).toEqual({
        message: 'Event with ID cccc not found.',
        error: 'Not Found',
        statusCode: 404,
      });
    }
    expect(throw_error).toBe(true);
  });
});

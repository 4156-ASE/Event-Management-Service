import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { EventEntity } from './models/event.entity';
import { NotFoundException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;
  const mockEventRepository = {
    save: jest
      .fn()
      .mockImplementation((event) =>
        of([Promise.resolve({ message: 'insert successfully', ...event })]),
      ),
    find: jest.fn().mockImplementation((arg) => {
      if (arg === undefined) {
        return of([
          Promise.resolve({ message: 'found1' }),
          Promise.resolve({ message: 'found2' }),
        ]);
      } else if (arg.where.id === 'aaaa') {
        return [Promise.resolve({ message: 'found1' })];
      } else if (arg.where.id === 'bbbb') {
        return [];
      } else {
        return undefined;
      }
    }),
    update: jest.fn().mockImplementation((eventID, updatedEvent) => {
      return { message: 'deleted event', id: eventID, ...updatedEvent };
    }),
    delete: jest.fn().mockImplementation((eventID) => {
      return { message: 'deleted event', id: eventID };
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(EventEntity),
          useValue: mockEventRepository,
        },
      ],
    }).compile();
    service = module.get<EventsService>(EventsService);
  });

  it('should insert event', async () => {
    const event = {
      id: 'aaaa',
      title: 'bbbb',
      desc: 'aaa',
      start_time: new Date('December 17, 2023 03:24:00'),
      end_time: new Date('December 17, 2023 03:24:00'),
      location: 'aaaa',
    };
    service.insertEvent(event).subscribe((data) => {
      expect(data).toEqual([
        Promise.resolve({ message: 'insert successfully', ...event }),
      ]);
    });
  });

  it('should find all events', async () => {
    service.getEvents().subscribe((data) => {
      expect(data).toEqual([
        Promise.resolve({ message: 'found1' }),
        Promise.resolve({ message: 'found2' }),
      ]);
    });
  });

  it('should return desired event', async () => {
    expect(await service.getEvent('aaaa')).toEqual({ message: 'found1' });
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
      id: 'aaaa',
      title: 'cccc',
      desc: 'aaa',
      start_time: new Date('December 17, 2023 03:24:00'),
      end_time: new Date('December 17, 2023 03:24:00'),
      location: 'aaaa',
    };
    service.updateEvent('aaaa', event);
    expect(mockEventRepository.update).toHaveBeenCalled();
  });

  it('should update event with id not match the given event id', async () => {
    const event = {
      id: 'aaaa',
      title: 'cccc',
      desc: 'aaa',
      start_time: new Date('December 17, 2023 03:24:00'),
      end_time: new Date('December 17, 2023 03:24:00'),
      location: 'aaaa',
    };
    service.updateEvent('bbbb', event);
    expect(mockEventRepository.update).toHaveBeenCalled();
  });

  it('should throw error when input id is not found when updating', async () => {
    let throw_error = false;
    const event = {
      id: 'cccc',
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
    service.deleteEvent('aaaa');
    expect(mockEventRepository.delete).toHaveBeenCalled();
  });
});

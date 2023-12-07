import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEntity } from './models/event.entity';
import { NotFoundException } from '@nestjs/common';
import {
  EventCreateReq,
  EventDetail,
  EventUpdateReq,
} from './models/event.dto';

describe('EventsService', () => {
  let service: EventsService;
  let repositoryMock: {
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    repositoryMock = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(EventEntity),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should insert an event', async () => {
    const event: EventCreateReq = {
      title: 'test',
      desc: 'test',
      start_time: '2021-04-01T00:00:00.000Z',
      end_time: '2021-04-01T00:00:00.000Z',
      location: 'test',
      host: 'test',
      participants: [],
      host_email: undefined,
      host_name: undefined,
      participants_email: [],
      participants_name: [],
    };
    repositoryMock.save.mockResolvedValue(event);
    jest
      .spyOn(service, 'eventEntity2EventDetail')
      .mockReturnValue(new EventDetail());
    await service.insertEvent('test', event);
    expect(service.eventEntity2EventDetail).toBeCalledTimes(1);
  });

  it('should get events, by pid', async () => {
    repositoryMock.find.mockResolvedValue([]);
    await service.getEvents({ cid: 'test', pid: 'test' });
    expect(repositoryMock.find).toBeCalledTimes(1);
  });

  it('should get events, by cid', async () => {
    repositoryMock.find.mockResolvedValue([]);
    await service.getEvents({ cid: 'test', pid: undefined });
    expect(repositoryMock.find).toBeCalledTimes(1);
  });

  it('should get an event', async () => {
    repositoryMock.findOne.mockResolvedValue(undefined);
    await expect(service.getEvent('test', 'test')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update an event', async () => {
    repositoryMock.update.mockResolvedValue({ affected: 1 });
    jest.spyOn(service, 'getEvent').mockResolvedValue(new EventDetail());
    await service.updateEvent('test', 'test', new EventUpdateReq());
    expect(service.getEvent).toBeCalledTimes(1);
  });

  it('should throw NotFoundException if update failed', async () => {
    repositoryMock.update.mockResolvedValue({ affected: 0 });
    jest.spyOn(service, 'getEvent').mockResolvedValue(new EventDetail());
    await expect(
      service.updateEvent('test', 'test', new EventUpdateReq()),
    ).rejects.toThrow(NotFoundException);
  });

  it('should delete an event', async () => {
    repositoryMock.delete.mockResolvedValue({ affected: 1 });
    jest.spyOn(service, 'getEvent').mockResolvedValue(new EventDetail());
    await service.deleteEvent('test', 'test');
    expect(service.getEvent).toBeCalledTimes(1);
  });

  it('should throw NotFoundException if delete failed', async () => {
    repositoryMock.delete.mockResolvedValue({ affected: 0 });
    jest.spyOn(service, 'getEvent').mockResolvedValue(undefined);
    await expect(service.deleteEvent('test', 'test')).rejects.toThrow(
      NotFoundException,
    );
  });
});

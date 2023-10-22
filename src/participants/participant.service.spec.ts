import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ParticipantsService } from './participant.service';
import { ParticipantEntity } from './models/participant.entity';
import { UserEntity } from '../../src/users/models/user.entity';
import { EventEntity } from '../../src/events/models/event.entity';
import { log } from 'console';


describe('ParticipantsService', () => {
  let participantService: ParticipantsService;
  const exampleUser1 = {
    id: 1,
    first_name: 'John',
    last_name: 'Host',
    email: 'testuser@test.com',
    password: 'encryptedPassword'
  };
  const exampleUser2 = {
    id: 2,
    first_name: 'Harry',
    last_name: 'Participant',
    email: 'harry@test.com',
    password: 'encryptedPassword'
  };
  const exampleUser3 = {
    id: 3,
    first_name: 'test',
    last_name: 'ToBeInvited',
    email: 'invite@test.com',
    password: 'encryptedPassword'
  };
  const exampleEvent = {
    id: "1234",
    title: 'Test Event',
    desc: 'This is a test event',
    start_time: new Date('December 17, 1995 03:24:00'),
    end_time: new Date('December 18, 1995 03:24:00'),
    location: 'Test Location',
    host: 1
  };
  const exampleParticipant = {
    id: 1,
    user: {
      ...exampleUser2
    },
    event: {
      ...exampleEvent
    },
    status: 'Test Status'
  };
  
  const mockUserRepository = {
    findOne: jest.fn((arg) => {
      if (arg.where.email == exampleUser3.email){
        return Promise.resolve(exampleUser3);
      }
      else if (arg.where.email == exampleUser2.email){
        return Promise.resolve(exampleUser2);
      }
      else if (arg.where.id == exampleUser2.id){
        return Promise.resolve(exampleUser2);
      }
      else{
        return Promise.resolve(null);
      }
    }),
    save: jest.fn((user) => {
      return Promise.resolve(user);
    })
  };
  const mockEventRepository = {
    findOne: jest.fn((arg) => {
      if (arg.where.id == exampleEvent.id){
        return Promise.resolve(exampleEvent);
      }
      else{
        return Promise.resolve(null);
      }
    })
  };
  const mockParticipantRepository = {
    findOne: jest.fn((arg) => {
      try {
        if (arg.where.id == exampleParticipant.id){
          return Promise.resolve(exampleParticipant);
        }
        else if (arg.where.event == exampleEvent && arg.where.user == exampleUser2){
          return Promise.resolve(exampleParticipant);
        }
        else if (arg.where.event.id == exampleEvent.id && arg.where.user.id == exampleUser2.id){
          return Promise.resolve(exampleParticipant);
        }
        else{
          return Promise.resolve(null);
        }
      } catch (error) {
        return Promise.resolve(null);
      }
    }),
    find: jest.fn((arg) => {
      if (arg.where.event.id == exampleEvent.id && arg.relations[0] == 'user'){
        return Promise.resolve([exampleParticipant]);
      }
      else{
        return Promise.resolve(null);
      }
    }),
    save: jest.fn((participant) => {
      return Promise.resolve(participant);
    }),
    delete: jest.fn((id) => {
      if (id == exampleParticipant.id){
        return Promise.resolve({
          affected: 1
        });
      }
      else{
        return Promise.resolve({
          affected: 0
        });
      }
    })
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipantsService,
        {
          provide: getRepositoryToken(ParticipantEntity),
          useValue: mockParticipantRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(EventEntity),
          useValue: mockEventRepository,
        },
      ],
    }).compile();


    participantService = module.get<ParticipantsService>(ParticipantsService);
  });

  it('should be defined', () => {
    expect(participantService).toBeDefined();
  });

  it('inviteParticipant: successful invite should return void', async () => {
    const result = await participantService.inviteParticipant(exampleEvent.id, exampleUser3);
    expect(result).toBeUndefined();
  });

  it('inviteParticipant: invalid event should throw NotFoundException', async () => {
    const result = participantService.inviteParticipant('invalidEventId', exampleUser3);
    await expect(result).rejects.toThrowError('Event not found');
  });

  it('inviteParticipant: invalid user should throw NotFoundException', async () => {
    const result = participantService.inviteParticipant(exampleEvent.id, {first_name: 'test', last_name: 'test', email: 'test@test.com'});
    await expect(result).rejects.toThrowError('User not found');
  });

  it('inviteParticipant: existing participant should throw ConflictException', async () => {
    const result = participantService.inviteParticipant(exampleEvent.id, exampleUser2);
    await expect(result).rejects.toThrowError('Participant already exists in the event');
  });

  it('updateParticipant: successful update should return user entity', async () => {
    const result = await participantService.updateParticipant(exampleEvent.id, exampleParticipant.user.id, exampleUser3);
    const {id, password, ...userData} = exampleUser3;
    expect(result).toEqual({
      id: exampleUser2.id,
      password: exampleUser2.password,
      ...userData
    });
  });

  it('updateParticipant: invalid event should throw NotFoundException', async () => {
    const result = participantService.updateParticipant('invalidEventId', exampleParticipant.user.id, exampleUser3);
    await expect(result).rejects.toThrowError('Event not found');
  });

  it('updateParticipant: invalid user should throw NotFoundException', async () => {
    const result = participantService.updateParticipant(exampleEvent.id, 100, exampleUser3);
    await expect(result).rejects.toThrowError('Participant not associated with this event');
  });
  
  it('deleteParticipant: successful delete should return void', async () => {
    const result = await participantService.deleteParticipant(exampleParticipant.id);
    expect(result).toBeUndefined();
  });

  it('deleteParticipant: invalid participant should throw NotFoundException', async () => {
    const result = participantService.deleteParticipant(100);
    await expect(result).rejects.toThrowError('Participant not found');
  });

  it('listParticipants: successful list should return list of participants', async () => {
    const result = await participantService.listParticipants(exampleEvent.id);
    expect(result).toEqual([
      exampleParticipant
    ]);
  });

  it('updateStatus: successful update should return void', async () => {
    const result = await participantService.updateStatus(exampleParticipant.id, 'New Status');
    expect(result).toBeUndefined();
  });

  it('updateStatus: invalid participant should throw NotFoundException', async () => {
    const result = participantService.updateStatus(100, 'New Status');
    await expect(result).rejects.toThrowError('Participant not found');
  });

});


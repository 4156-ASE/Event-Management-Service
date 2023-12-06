/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantsController } from './participant.controller';
import { ParticipantsService } from './participant.service';
import { ParticipantEntity } from './models/participant.entity';
import { UserEntity } from '../../src/users/models/user.entity';
import { ClientEntity } from '../../src/users/models/client.entity';
import { EventEntity } from '../../src/events/models/event.entity';
import {
  createClient,
  createEvent,
  createParticipant,
  createUser,
  randomEmail,
  randomString,
} from '../test.util';
import { copyFile } from 'fs';
import { 
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

describe('ParticipantsController', () => {
  
  // const mockClients: ClientEntity[] = [
  //   createClient(),
  //   createClient(),
  // ];
  // const mockUsers: UserEntity[] = [
  //   createUser(mockClients[0], 'admin'),
  //   createUser(mockClients[0], 'regular'),
  //   createUser(mockClients[0], 'regular'),
  //   createUser(mockClients[0], 'regular'),

  //   createUser(mockClients[1], 'admin'),
  //   createUser(mockClients[1], 'regular'),
  //   createUser(mockClients[1], 'regular'),
  // ];
  // const mockEvents: EventEntity[] = [
  //   createEvent(mockClients[0], mockUsers[1]),
  //   createEvent(mockClients[0], mockUsers[2]),
  //   createEvent(mockClients[1], mockUsers[5]),
  // ];
  // const mockParticipants: ParticipantEntity[] = [
  //   createParticipant(mockUsers[2], mockEvents[0], 'pending'),
  //   createParticipant(mockUsers[1], mockEvents[1], 'accept'),
  //   createParticipant(mockUsers[6], mockEvents[2], 'reject'),
  // ];

  let participantController: ParticipantsController;
  // const mockParticipantsService = {
  //   inviteParticipant: jest.fn(
  //     (
  //       headers: any,
  //       eventId: string,
  //       user: { first_name: string; last_name: string; email: string },
  //     ): Promise<void> => {
  //       return Promise.resolve();
  //     },
  //   ),
  //   updateParticipant: jest.fn(
  //     (
  //       headers: any,
  //       eventId: string,
  //       pid: number,
  //       user: { first_name: string; last_name: string; email: string },
  //     ): Promise<UserEntity> => {
  //       return Promise.resolve(
  //         mockUsers[0]
  //       );
  //     },
  //   ),
  //   deleteParticipant: jest.fn((headers: any, pid: number): Promise<void> => {
  //     return Promise.resolve();
  //   }),
  //   listParticipants: jest.fn(
  //     (headers:any, eventId: string): Promise<ParticipantEntity[]> => {
  //       return Promise.resolve([
  //         mockParticipants[0],
  //       ]);
  //     },
  //   ),
  //   updateStatus: jest.fn((pid: number, eventID: string, status: string): Promise<void> => {
  //     return Promise.resolve();
  //   }),
  //   sendEmailToAllParticipants: jest.fn((eventId: string): Promise<void> => {
  //     return Promise.resolve();
  //   }),
  // };

  beforeEach(async () => {
    // const module: TestingModule = await Test.createTestingModule({
    //   controllers: [ParticipantsController],
    //   providers: [ParticipantsService],
    // })
    //   .overrideProvider(ParticipantsService)
    //   .useValue(mockParticipantsService)
    //   .compile();

    // participantController = module.get<ParticipantsController>(
    //   ParticipantsController,
    // );
  });

  // it('should be defined', () => {
  //   expect(participantController).toBeDefined();
  // });
  // it('should invite a participant', async () => {
  //   const headers = {
  //     authorization: mockClients[0].client_token,
  //   };
  //   const eventId = mockEvents[0].eid;
  //   const user = mockUsers[3];
  //   await participantController.inviteParticipant(headers, eventId, user);
  //   expect(mockParticipantsService.inviteParticipant).toHaveBeenCalledWith(
  //     headers,
  //     eventId,
  //     user,
  //   );
  // });

  // it('should update a participant', async () => {
  //   const headers = {
  //     authorization: mockClients[0].client_token,
  //   };
  //   const pid = mockParticipants[0].user.pid;
  //   const eventId = mockParticipants[0].event.eid;
  //   const user = {
  //     first_name: mockUsers[0].first_name,
  //     last_name: mockUsers[0].last_name,
  //     email: mockUsers[0].email,
  //   };
  //   const result = await participantController.updateParticipantDetails(headers, eventId, pid, user);
  //   expect(mockParticipantsService.updateParticipant).toHaveBeenCalledWith(
  //     headers,
  //     eventId,
  //     pid,
  //     user,
  //   );
  //   expect(result).toEqual(
  //     {
  //       first_name: mockUsers[0].first_name,
  //       last_name: mockUsers[0].last_name,
  //       email: mockUsers[0].email,
  //     }
  //   );
  // });
  
  // it('should delete a participant', async () => {
  //   const headers = {
  //     authorization: mockClients[0].client_token,
  //   };
  //   const pid = mockParticipants[0].user.pid;
  //   const eid = mockParticipants[0].event.eid;
  //   await participantController.deleteParticipant(headers, pid, eid);
  //   expect(mockParticipantsService.deleteParticipant).toHaveBeenCalledWith(
  //     headers,
  //     pid,
  //     eid
  //   );
  // });

  // it('should list participants', async () => {
  //   const headers = {
  //     authorization: mockClients[0].client_token,
  //   };
  //   const eventId = mockEvents[0].eid;
  //   const result = await participantController.listParticipants(headers, eventId);
  //   expect(mockParticipantsService.listParticipants).toHaveBeenCalledWith(
  //     headers,
  //     eventId,
  //   );
  //   expect(result).toEqual([
  //     {
  //       pid: mockParticipants[0].user.pid,
  //       first_name: mockParticipants[0].user.first_name,
  //       last_name: mockParticipants[0].user.last_name,
  //       email: mockParticipants[0].user.email,
  //       status: mockParticipants[0].status,
  //     },
  //   ]);
  // });

  // it('should send email to all participants', async () => {
  //   const headers = {
  //     authorization: mockClients[0].client_token,
  //   };
  //   const eventId = mockParticipants[0].event.eid;
  //   await participantController.sendEmailToAllParticipants(headers, eventId);
  //   expect(mockParticipantsService.sendEmailToAllParticipants).toHaveBeenCalledWith(
  //     headers,
  //     eventId,
  //   );
  // });

  // it('should update the status of a participant', async () => {
  //   const pid = mockParticipants[0].user.pid;
  //   const eventId = mockParticipants[0].event.eid;
  //   const status = 'accept';
  //   await participantController.updateParticipantStatus(pid, status, eventId);
  //   expect(mockParticipantsService.updateStatus).toHaveBeenCalledWith(
  //     pid,
  //     eventId,
  //     status,
  //   );
  // });

  // // Error handling
  // it('inviteParticipant: should throw an error if not found', async () => {
  //   const headers = {
  //     authorization: mockClients[0].client_token,
  //   };
  //   const eventId = mockEvents[0].eid;
  //   const user = mockUsers[3];
  //   mockParticipantsService.inviteParticipant = jest.fn(
  //     (
  //       headers: any,
  //       eventId: string,
  //       user: { first_name: string; last_name: string; email: string },
  //     ): Promise<void> => {
  //       throw new NotFoundException(`Event not found`);
  //     },
  //   );
  //   await expect(
  //     participantController.inviteParticipant(headers, eventId, user),
  //   ).rejects.toThrow(new NotFoundException('Event not found'));
  // });

  // it('inviteParticipant: should throw an error if failed to invite', async () => {
  //   const headers = {
  //     authorization: mockClients[0].client_token,
  //   };
  //   const eventId = mockEvents[0].eid;
  //   const user = mockUsers[3];
  //   mockParticipantsService.inviteParticipant = jest.fn(
  //     (
  //       headers: any,
  //       eventId: string,
  //       user: { first_name: string; last_name: string; email: string },
  //     ): Promise<void> => {
  //       throw new ConflictException('Participant already exists in the event')
  //     },
  //   );
  //   await expect(
  //     participantController.inviteParticipant(headers, eventId, user),
  //   ).rejects.toThrow(
  //     new InternalServerErrorException('Failed to invite the participant'),
  //   );
  // });

  // it('updateParticipantDetails: should throw an error if not found', async () => {
  //   const headers = {
  //     authorization: mockClients[0].client_token,
  //   };
  //   const pid = mockParticipants[0].user.pid;
  //   const eventId = mockParticipants[0].event.eid;
  //   const user = {
  //     first_name: mockUsers[0].first_name,
  //     last_name: mockUsers[0].last_name,
  //     email: mockUsers[0].email,
  //   };
  //   mockParticipantsService.updateParticipant = jest.fn(
  //     (
  //       headers: any,
  //       eventId: string,
  //       pid: number,
  //       user: { first_name: string; last_name: string; email: string },
  //     ): Promise<UserEntity> => {
  //       throw new NotFoundException(`Participant not found`);
  //     },
  //   );
  //   await expect(
  //     participantController.updateParticipantDetails(headers, eventId, pid, user),
  //   ).rejects.toThrow(new NotFoundException('Participant not found'));
  // });

  // it('updateParticipantDetails: should throw an error if failed to update', async () => {
  //   const headers = {
  //     authorization: mockClients[0].client_token,
  //   };
  //   const pid = mockParticipants[0].user.pid;
  //   const eventId = mockParticipants[0].event.eid;
  //   const user = {
  //     first_name: mockUsers[0].first_name,
  //     last_name: mockUsers[0].last_name,
  //     email: mockUsers[0].email,
  //   };
  //   mockParticipantsService.updateParticipant = jest.fn(
  //     (
  //       headers: any,
  //       eventId: string,
  //       pid: number,
  //       user: { first_name: string; last_name: string; email: string },
  //     ): Promise<UserEntity> => {
  //       throw new ConflictException('Participant already exists in the event')
  //     },
  //   );
  //   await expect(
  //     participantController.updateParticipantDetails(headers, eventId, pid, user),
  //   ).rejects.toThrow(
  //     new InternalServerErrorException('Failed to update the participant'),
  //   );
  // });

  // it('deleteParticipant: should throw an error if not found', async () => {
  //   const headers = {
  //     authorization: mockClients[0].client_token,
  //   };
  //   const pid = mockParticipants[0].user.pid;
  //   const eventId = mockParticipants[0].event.eid;
  //   mockParticipantsService.deleteParticipant = jest.fn(
  //     (headers: any, pid: number): Promise<void> => {
  //       throw new NotFoundException(`Participant not found`);
  //     },
  //   );
  //   await expect(
  //     participantController.deleteParticipant(headers, pid, eventId),
  //   ).rejects.toThrow(new NotFoundException('Participant not found'));
  // });

  // it('deleteParticipant: should throw an error if failed to delete', async () => {
  //   const headers = {
  //     authorization: mockClients[0].client_token,
  //   };
  //   const pid = mockParticipants[0].user.pid;
  //   const eventId = mockParticipants[0].event.eid;
  //   mockParticipantsService.deleteParticipant = jest.fn(
  //     (headers: any, pid: number): Promise<void> => {
  //       throw new ConflictException('Participant already exists in the event')
  //     },
  //   );
  //   await expect(
  //     participantController.deleteParticipant(headers, pid, eventId),
  //   ).rejects.toThrow(
  //     new InternalServerErrorException('Failed to delete the participant'),
  //   );
  // });

  // it('listParticipants: should throw an error if not found', async () => {
  //   const headers = {
  //     authorization: mockClients[0].client_token,
  //   };
  //   const eventId = mockEvents[0].eid;
  //   mockParticipantsService.listParticipants = jest.fn(
  //     (headers:any, eventId: string): Promise<ParticipantEntity[]> => {
  //       throw new NotFoundException(`Event not found`);
  //     },
  //   );
  //   await expect(
  //     participantController.listParticipants(headers, eventId),
  //   ).rejects.toThrow(new NotFoundException('Event not found'));
  // });

  // it('listParticipants: should throw an error if failed to list', async () => {
  //   const headers = {
  //     authorization: mockClients[0].client_token,
  //   };
  //   const eventId = mockEvents[0].eid;
  //   mockParticipantsService.listParticipants = jest.fn(
  //     (headers:any, eventId: string): Promise<ParticipantEntity[]> => {
  //       throw new ConflictException('Participant already exists in the event')
  //     },
  //   );
  //   await expect(
  //     participantController.listParticipants(headers, eventId),
  //   ).rejects.toThrow(
  //     new InternalServerErrorException('Failed to fetch participants'),
  //   );
  // });

  // it('updateParticipantStatus: should throw an error if not found', async () => {
  //   const pid = mockParticipants[0].user.pid;
  //   const eventId = mockParticipants[0].event.eid;
  //   const status = 'accept';
  //   mockParticipantsService.updateStatus = jest.fn(
  //     (pid: number, eventId: string, status: string): Promise<void> => {
  //       throw new NotFoundException(`Participant not found`);
  //     },
  //   );
  //   await expect(
  //     participantController.updateParticipantStatus(pid, status, eventId),
  //   ).rejects.toThrow(new NotFoundException('Participant not found'));
  // });

  // it('updateParticipantStatus: should throw an error if failed to update', async () => {
  //   const pid = mockParticipants[0].user.pid;
  //   const eventId = mockParticipants[0].event.eid;
  //   const status = 'accept';
  //   mockParticipantsService.updateStatus = jest.fn(
  //     (pid: number, eventId: string, status: string): Promise<void> => {
  //       throw new ConflictException('Participant already exists in the event')
  //     },
  //   );
  //   await expect(
  //     participantController.updateParticipantStatus(pid, status, eventId),
  //   ).rejects.toThrow(
  //     new InternalServerErrorException('Failed to update the status'),
  //   );
  // });


  
});
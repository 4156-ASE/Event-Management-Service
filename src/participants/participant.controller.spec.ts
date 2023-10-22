import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantsController } from './participant.controller';
import { ParticipantsService } from './participant.service';
import { ParticipantEntity } from './models/participant.entity';
import { UserEntity } from '../../src/users/models/user.entity';

describe('ParticipantsController', () => {
    let participantController: ParticipantsController;
    // create a mock of the ParticipantsService
    const mockParticipantsService = {
        inviteParticipant: jest.fn((eventId: string, user: { first_name: string; last_name: string; email: string }):Promise<void> => {
            return Promise.resolve();
        }),
        updateParticipant: jest.fn((eventId: string, pid: number, user: { first_name: string; last_name: string; email: string }): Promise<UserEntity> => {
            // return a mock user entity object
            return Promise.resolve({
                id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'testupdate@test.com',
                password: 'encodedPassword'
            });
        }),
        deleteParticipant: jest.fn((pid: number): Promise<void> => {
            return Promise.resolve();
        }),
        listParticipants: jest.fn((eventId: string): Promise<ParticipantEntity[]> => {
            return Promise.resolve([{
                id: 1,
                user: {
                    id: 1,
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'testlist@test.com',
                    password: 'encodedPassword'
                },
                event: {
                    id: "1234",
                    title: 'Test Event',
                    desc: 'This is a test event',
                    start_time: new Date('December 17, 1995 03:24:00'),
                    end_time: new Date('December 18, 1995 03:24:00'),
                    location: 'Test Location',
                    host: 3
                },
                status: 'Test Status'
            }, 
            {
                id: 2,
                user: {
                    id: 3,
                    first_name: 'test_firstname',
                    last_name: 'test_lastname',
                    email: 'testuser@test.com',
                    password: 'encodedPassword'
                },
                event: {
                    id: "1234",
                    title: 'Test Event',
                    desc: 'This is a test event',
                    start_time: new Date('December 17, 1995 03:24:00'),
                    end_time: new Date('December 18, 1995 03:24:00'),
                    location: 'Test Location',
                    host: 3
                },
                status: 'Test Status'
            }])
        }),
        updateStatus: jest.fn((pid: number, status: string): Promise<void> => {
            return Promise.resolve();
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ParticipantsController],
            providers: [ParticipantsService],
        }).overrideProvider(ParticipantsService)
        .useValue(mockParticipantsService)
        .compile();

        participantController = module.get<ParticipantsController>(ParticipantsController);
    });

    it('should be defined', () => {
        expect(participantController).toBeDefined();
    });
    it('should call inviteParticipant', async() => {
        const user = {
            first_name: 'John',
            last_name: 'Doe',
            email: 'test@test.com'
        };
        const eventId = '1234';
        const result = await participantController.inviteParticipant(eventId, user);
        expect(result).toEqual({ message: 'Invitations sent successfully.' });
    });
    it('should call updateParticipantDetails', async() => {
        const user = {
            first_name: 'John',
            last_name: 'Doe',
            email: 'test@test.com'
        };
        const eventId = '1234';
        const pid = 1;
        const result = await participantController.updateParticipantDetails(eventId, pid, user);
        expect(result).toEqual({
            first_name: 'John',
            last_name: 'Doe',
            email: 'testupdate@test.com'
        });
    });
    it('should call deleteParticipant', async() => {
        const pid = 1;
        const result = await participantController.deleteParticipant(pid);
        expect(result).toEqual({ message: 'Participant deleted successfully' });
    });

    it('should call listParticipants', async () => {
        const eventId = '1234';
        const result = await participantController.listParticipants(eventId);
        expect(result).toEqual([
            {
                pid: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'testlist@test.com',
                status: 'Test Status',
            },
            {
                pid: 2,
                first_name: 'test_firstname',
                last_name: 'test_lastname',
                email: 'testuser@test.com',
                status: 'Test Status',
            }
        ]);
    });

    it('should call updateStatus', async () => {
        const pid = 1;
        const status = 'Test Status';
        const result = await participantController.updateParticipantStatus(pid, status);
        expect(result).toEqual({ message: 'Thank you for your response. We look forward to your participation!' });
    });

});

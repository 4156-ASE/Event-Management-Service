import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParticipantEntity } from './models/participant.entity';
import { UserEntity } from '../../src/users/models/user.entity';
import { EventEntity } from '../../src/events/models/event.entity';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(ParticipantEntity)
    private participantRepository: Repository<ParticipantEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
  ) {}

  async inviteParticipant(
    eventId: string,
    user: { first_name: string; last_name: string; email: string },
  ): Promise<void> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event not found`);
    }

    const foundUser = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    const existingParticipant = await this.participantRepository.findOne({
      where: {
        event: event,
        user: foundUser,
      },
    });

    if (existingParticipant) {
      throw new ConflictException('Participant already exists in the event');
    }

    const newParticipant = new ParticipantEntity();
    newParticipant.event = event;
    newParticipant.user = foundUser;
    newParticipant.status = 'invited';

    try {
      await this.participantRepository.save(newParticipant);
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to invite the participant',
      );
    }
  }

  async updateParticipant(
    eventId: string,
    pid: number,
    user: { first_name: string; last_name: string; email: string },
  ): Promise<UserEntity> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event not found`);
    }

    const participant = await this.participantRepository.findOne({
      where: {
        user: { id: pid },
        event: { id: eventId },
      },
    });

    if (!participant) {
      throw new NotFoundException(`Participant not associated with this event`);
    }

    const foundUser = await this.userRepository.findOne({ where: { id: pid } });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    foundUser.first_name = user.first_name;
    foundUser.last_name = user.last_name;
    foundUser.email = user.email;

    return await this.userRepository.save(foundUser);
  }

  async deleteParticipant(pid: number): Promise<void> {
    const result = await this.participantRepository.delete(pid);
    if (result.affected === 0) {
      throw new NotFoundException('Participant not found');
    }
  }

  async listParticipants(eventId: string): Promise<ParticipantEntity[]> {
    return await this.participantRepository.find({
      where: { event: { id: eventId } },
      relations: ['user'],
    });
  }

  async updateStatus(pid: number, status: string): Promise<void> {
    const participant = await this.participantRepository.findOne({
      where: { id: pid },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    participant.status = status;

    await this.participantRepository.save(participant);
  }
}

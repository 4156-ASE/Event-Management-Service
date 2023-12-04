import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity } from './models/event.entity';
import { EventInterface } from './models/event.interface';
import { EventCreateReq, EventDetail, UpdateEventDTO } from './models/event.dto';
import { UserEntity } from 'src/users/models/user.entity';

/**
 * Event Service which will handle event relevent database operations, can be used by event controller.
 */
@Injectable()
export class EventsService {
  /**
   * Event constructor which will inject event repository.
   * @param eventRepository
   */
  constructor(
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Insert a event into database.
   */
  async insertEvent(cid: string, data: EventCreateReq): Promise<EventDetail> {
    const event = await this.eventRepository.save({
      title: data.title,
      desc: data.desc,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location,
      host: data.host,
      client: {
        cid: cid,
      },
    });

    return {
      id: event.eid,
      title: event.title,
      desc: event.desc,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location,
      host: event.host,
      cid: event.client.cid,
    };
  }

  /**
   * Get all the events of a client based on client cid.
   */
  // async getEvents(cid: string): Promise<EventInterface[]> {
  //   return await this.eventRepository.find({
  //     where: { client: { cid } },
  //   });
  // }

  /**
   * Get a event by eventID.
   */
  async getEvent(cid: string, eventID: string): Promise<EventEntity> {
    const event = await this.eventRepository.findOne({
      where: {
        eid: eventID,
      },
    });
    if (!event) {
      throw new NotFoundException('Event Not Found.');
    }

    if (cid !== event.client.cid) {
      throw new UnauthorizedException('Client does not match');
    }
    return event;
  }

  /**
   * Update a event by eventID.
   */
  async updateEvent(
    cid: string,
    eventID: string,
    updatedEvent: UpdateEventDTO,
  ) {
    const event = await this.eventRepository.findOne({
      where: {
        eid: eventID,
      },
    });
    if (!event) {
      throw new NotFoundException(`Event Not Found.`);
    }
    if (event.client.cid !== cid) {
      throw new UnauthorizedException('Client does not match');
    }

    const protectList = ['eid'];
    protectList.forEach((key) => {
      if (key in updatedEvent) {
        delete updatedEvent[key];
      }
    });
    await this.eventRepository.update({ eid: eventID }, updatedEvent);
  }

  /**
   * Delete a event by eventID.
   * @param {string} eventID The event ID.
   */
  async deleteEvent(cid: string, eventID: string): Promise<boolean> {
    const event = await this.eventRepository.findOne({
      where: {
        eid: eventID,
      },
    });
    if (!event) {
      throw new NotFoundException(`Event Not Found.`);
    }
    if (event.client.cid !== cid) {
      throw new UnauthorizedException('Client does not match');
    }

    const result = await this.eventRepository.delete(eventID);

    return result.affected === 1;
  }
}

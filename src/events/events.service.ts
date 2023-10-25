import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity } from './models/event.entity';
import { EventInterface } from './models/event.interface';
import { from, Observable } from 'rxjs';
import { CreateEventDTO, UpdateEventDTO } from './models/event.dto';
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
   * @param {CreateEventDTO} event The EventInterface object that need to be inserted into database.
   * @returns {Observable<EventInterface>} Return the content of the event object.
   */
  async insertEvent(event: CreateEventDTO): Promise<EventInterface> {
    const user = await this.userRepository.findOne({
      where: { id: event.host },
    });

    if (!user) {
      throw new HttpException(
        'Host not found in user database',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.eventRepository.save(event);
  }

  /**
   * Get all the events.
   * @returns {Observable<EventInterface[]>} The information of all the events from database.
   */
  getEvents(): Observable<EventInterface[]> {
    return from(this.eventRepository.find());
  }

  /**
   * Get a event by eventID.
   * @param {string} eventID The event ID.
   * @returns {Promise<EventEntity>} The information of the target event from database.
   */
  async getEvent(eventID: string): Promise<EventEntity> {
    const events = await this.eventRepository.find({
      where: {
        id: eventID,
      },
    });
    if (events.length === 0) {
      throw new NotFoundException('Event Not Found.');
    }

    return events[0];
  }

  /**
   * Update a event by eventID.
   * @param {string} eventID The event ID.
   * @param {UpdateEventDTO} updatedEvent The information that need to be modified in an event.
   */
  async updateEvent(eventID: string, updatedEvent: UpdateEventDTO) {
    const events = await this.eventRepository.find({
      where: {
        id: eventID,
      },
    });
    if (events.length === 0) {
      throw new NotFoundException(`Could not find event: ${eventID}.`);
    }
    const protectList = ['id'];
    protectList.forEach((key) => {
      if (key in updatedEvent) {
        delete updatedEvent[key];
      }
    });
    await this.eventRepository.update({ id: eventID }, updatedEvent);
  }

  /**
   * Delete a event by eventID.
   * @param {string} eventID The event ID.
   */
  async deleteEvent(eventID: string): Promise<void> {
    const result = await this.eventRepository.delete(eventID);
    if (result.affected === 0) {
      throw new NotFoundException(`Event with ID ${eventID} not found.`);
    }
  }
}

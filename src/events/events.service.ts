import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity } from './models/event.entity';
import { EventInterface } from './models/event.interface';
import { from, Observable } from 'rxjs';

/**
 * Event Service which will handle event relevent database operations, can be used by event controller.
 */
@Injectable()
export class EventsService {
  /**
   * Event constructor which will inject event repository.
   * @param eventRepostitory
   */
  constructor(
    @InjectRepository(EventEntity)
    private eventRepostitory: Repository<EventEntity>,
  ) {}

  /**
   * Insert a event into database.
   * @param {EventInterface} event The EventInterface object that need to be inserted into database.
   * @returns {Observable<EventInterface>} Return the content of the event object.
   */
  insertEvent(event: EventInterface): Observable<EventInterface> {

    return from(this.eventRepostitory.save(event));
  }

  /**
   * Get all the events.
   * @returns {Observable<EventInterface[]>} The information of all the events from database.
   */
  getEvents(): Observable<EventInterface[]> {
    return from(this.eventRepostitory.find());
  }

  /**
   * Get a event by eventID.
   * @param {string} eventID The event ID.
   * @returns {Promise<EventEntity>} The information of the target event from database.
   */
  async getEvent(eventID: string): Promise<EventEntity> {
    const events = await this.eventRepostitory.find({
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
   * @param {Partial<EventInterface>} updatedEvent The information that need to be modified in an event.
   */
  updateEvent(eventID: string, updatedEvent: Partial<EventEntity>) {
    const event = this.eventRepostitory.find({
      where: {
        id: eventID,
      },
    });
    if (!event) {
      throw new NotFoundException(`Could not find event: ${eventID}.`);
    }

    const protectList = ['id'];
    protectList.forEach((key) => {
      if (key in updatedEvent) {
        delete updatedEvent[key];
      }
    });
    this.eventRepostitory.update(eventID, updatedEvent);
  }

  /**
   * Delete a event by eventID.
   * @param {string} eventID The event ID.
   */
  deleteEvent(eventID: string) {
    this.eventRepostitory.delete(eventID);
  }
}

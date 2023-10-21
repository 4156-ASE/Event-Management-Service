import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity } from './models/event.entity';
import { EventInterface } from './models/event.interface';
import { from, Observable } from 'rxjs';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private eventRepostitory: Repository<EventEntity>,
  ) {}

  insertEvent(event: Partial<EventInterface>): Observable<EventInterface> {
    return from(this.eventRepostitory.save(event));
  }

  getEvents(): Observable<EventInterface[]> {
    return from(this.eventRepostitory.find());
  }

  async getEvent(eventID: string) {
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

  deleteEvent(eventID: string) {
    this.eventRepostitory.delete(eventID);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EventEntity } from './models/event.entity';
import {
  EventCreateReq,
  EventDetail,
  EventUpdateReq,
} from './models/event.dto';

function eventEntity2EventDetail(cid: string, event: EventEntity): EventDetail {
  return {
    id: event.eid,
    cid,
    title: event.title,
    location: event.location,
    desc: event.desc,
    host: event.host,
    participants: event.participants,
    start_time: event.start_time.toISOString(),
    end_time: event.end_time.toISOString(),
  };
}

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
  ) {}

  /**
   * Insert an event into database.
   */
  async insertEvent(cid: string, data: EventCreateReq): Promise<EventDetail> {
    const event = await this.eventRepository.save({
      title: data.title,
      desc: data.desc,
      start_time: new Date(data.start_time),
      end_time: new Date(data.end_time),
      location: data.location,
      host: data.host,
      participants: data.participants,
      client: {
        cid: cid,
      },
    });

    return eventEntity2EventDetail(cid, event);
  }

  /**
   * Get all the events of a client based on client cid.
   */
  async getEvents(query: {
    cid: string;
    pid?: string;
  }): Promise<EventDetail[]> {
    const where = query.pid
      ? [
          // find events as host
          {
            client: {
              cid: query.cid,
            },
            host: query.pid,
          },

          // find events as participants
          {
            client: {
              cid: query.cid,
            },
            participants: In([query.pid]),
          },
        ]
      : // find all events from a client
        {
          client: {
            cid: query.cid,
          },
        };
    const events = await this.eventRepository.find({
      where: where,
    });

    return events.map((val) => eventEntity2EventDetail(query.cid, val));
  }

  /**
   * Get an event by eventID.
   */
  async getEvent(cid: string, eventID: string): Promise<EventDetail> {
    const event = await this.eventRepository.findOne({
      where: {
        client: {
          cid: cid,
        },
        eid: eventID,
      },
    });
    if (!event) {
      throw new NotFoundException('Event Not Found.');
    }

    return eventEntity2EventDetail(cid, event);
  }

  /**
   * Update an event by eventID.
   */
  async updateEvent(
    cid: string,
    eventID: string,
    updatedEvent: EventUpdateReq,
  ) {
    const protectList = ['eid'];
    protectList.forEach((key) => {
      if (key in updatedEvent) {
        delete updatedEvent[key];
      }
    });
    const result = await this.eventRepository.update(
      {
        eid: eventID,
        client: {
          cid,
        },
      },
      updatedEvent,
    );

    if (result.affected !== 1) {
      throw new NotFoundException('Not found event');
    }

    const event = await this.getEvent(cid, eventID);

    return event;
  }

  /**
   * Delete an event by eventID.
   * @param {string} eventID The event ID.
   */
  async deleteEvent(cid: string, eventID: string): Promise<boolean> {
    const event = await this.getEvent(cid, eventID);
    if (!event) {
      throw new NotFoundException(`Event Not Found.`);
    }

    const result = await this.eventRepository.delete(eventID);

    return result.affected === 1;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';

import { Event } from './events.model';

@Injectable()
export class EventsService {
  private events: Event[] = [];

  insertEvent(title: string, desc: string) {
    const eventID = Math.random().toString();
    const newEvent = new Event(eventID, title, desc);
    this.events.push(newEvent);
    return eventID;
  }

  getEvents() {
    return [...this.events];
  }

  getEvent(eventID: string) {
    const event = this.findEvent(eventID)[0];
    return { ...event };
  }

  updateEvent(eventID: string, title: string, desc: string) {
    const [event, index] = this.findEvent(eventID);
    const updatedEvent = { ...event };
    if (title) {
      updatedEvent.title = title;
    }
    if (desc) {
      updatedEvent.desc = desc;
    }
    this.events[index] = updatedEvent;
  }

  deleteEvent(eventID: string) {
    const index = this.findEvent(eventID)[1];
    this.events.splice(index);
  }

  private findEvent(id: string): [Event, number] {
    const eventIndex = this.events.findIndex((event) => event.id === id);
    const event = this.events[eventIndex];
    if (!event) {
      throw new NotFoundException('Cound not find event.');
    }
    return [event, eventIndex];
  }
}

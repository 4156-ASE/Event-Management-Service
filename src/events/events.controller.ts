import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { EventsService } from './events.service';
import { EventInterface } from './models/event.interface';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  createEvent(
    @Body() event: Partial<EventInterface>,
  ): Observable<EventInterface> {
    return this.eventsService.insertEvent(event);
  }

  @Get()
  getAllEvents(): Observable<EventInterface[]> {
    return this.eventsService.getEvents();
  }

  @Get(':eventId')
  getEvent(@Param('eventId') eventId: string): Observable<EventInterface> {
    return from(this.eventsService.getEvent(eventId));
  }

  @Patch(':eventId')
  updateEvent(
    @Param('eventId') eventId: string,
    @Body() event: Partial<EventInterface>,
  ) {
    this.eventsService.updateEvent(eventId, event);
    return {
      ok: true,
      message: 'Event updated successfully',
    };
  }

  @Delete(':eventId')
  removeEvent(@Param('eventId') eventId: string) {
    this.eventsService.deleteEvent(eventId);
    return {
      ok: true,
      message: 'Event deleted successfully',
    };
  }
}

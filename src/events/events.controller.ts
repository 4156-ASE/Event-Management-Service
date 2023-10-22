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

/**
 * The event controller which will handle the event relevant operations.
 */
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  /**
   * Create a event.
   * @param {EventInterface} event The information of the event that need to be created. The title, start time and end time are required, other information are optional
   * @returns {Observable<EventInterface>} Return the content of the event object.
   */
  @Post()
  createEvent(@Body() event: EventInterface): Observable<EventInterface> {
    return this.eventsService.insertEvent(event);
  }

  /**
   * Get all the events.
   * @returns {Observable<EventInterface[]>} The information of all the events.
   */
  @Get()
  getAllEvents(): Observable<EventInterface[]> {
    return this.eventsService.getEvents();
  }

  /**
   * Get a event by EventID.
   * @param {string} eventId The event ID.
   * @returns {Observable<EventInterface>} The information of the target event.
   */
  @Get(':id')
  getEvent(@Param('id') eventId: string): Observable<EventInterface> {
    return from(this.eventsService.getEvent(eventId));
  }

  /**
   * Update Event by EventID.
   * @param {string} eventId The event ID.
   * @param {Partial<EventInterface>} event The information that need to be modified in an event.
   * @returns {Object} Return status of the event update.
   */
  @Patch(':id')
  updateEvent(
    @Param('id') eventId: string,
    @Body() event: Partial<EventInterface>,
  ) {
    this.eventsService.updateEvent(eventId, event);
    return {
      success: true,
    };
  }

  /**
   * Remove Event by EventID.
   * @param {string} eventId The event ID.
   * @returns {Object} Return status of the event delete.
   */
  @Delete(':id')
  removeEvent(@Param('id') eventId: string) {
    this.eventsService.deleteEvent(eventId);
    return {
      success: true,
    };
  }
}

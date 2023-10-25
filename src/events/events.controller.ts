import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { EventsService } from './events.service';
import { EventInterface } from './models/event.interface';
import { CreateEventDTO, UpdateEventDTO } from './models/event.dto';

/**
 * The event controller which will handle the event relevant operations.
 */
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  /**
   * Create a event.
   * @param {CreateEventDTO} event The information of the event that need to be created.
   * @returns {Promise<EventInterface>} Return the content of the event object.
   */
  @Post()
  async createEvent(@Body() event: CreateEventDTO): Promise<EventInterface> {
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
   * @param {UpdateEventDTO} event The information that need to be modified in an event.
   * @returns {Object} Return status of the event update.
   */
  @Patch(':eventId')
  async updateEvent(
    @Param('eventId') eventId: string,
    @Body() event: UpdateEventDTO,
  ) {
    await this.eventsService.updateEvent(eventId, event);
    return {
      status: HttpStatus.OK,
      message: 'Event updated successfully',
    };
  }

  /**
   * Remove Event by EventID.
   * @param {string} eventId The event ID.
   * @returns {Object} Return status of the event delete.
   */
  @Delete(':id')
  async removeEvent(@Param('id') eventId: string) {
    await this.eventsService.deleteEvent(eventId);
    return {
      status: HttpStatus.OK,
      message: 'Event deleted successfully',
    };
  }
}

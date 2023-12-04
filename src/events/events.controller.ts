import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  HttpStatus,
  Headers,
  Req,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { EventInterface } from './models/event.interface';
import { EventCreateReq, EventDetail, UpdateEventDTO } from './models/event.dto';
import { Request } from 'express';

/**
 * The event controller which will handle the event relevant operations.
 */
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  /**
   * Create a event.
   */
  @Post()
  async createEvent(
    @Req() req: Request,
    @Body() body: EventCreateReq,
  ): Promise<EventDetail> {
    return await this.eventsService.insertEvent(req.client.cid, body);
  }

  /**
   * Get all the events.
   * @returns {Promise<EventInterface[]>} The information of all the events.
   */
  // @Get()
  // async getAllEvents(@Headers() headers): Promise<EventInterface[]> {
  //   return await this.eventsService.getEvents(headers);
  // }

  /**
   * Get a event by EventID.
   * @param {string} eventId The event ID.
   * @returns {Promise<EventInterface>} The information of the target event.
   */
  // @Get(':id')
  // async getEvent(
  //   @Headers() headers,
  //   @Param('id') eventId: string,
  // ): Promise<EventInterface> {
  //   return await this.eventsService.getEvent(headers, eventId);
  // }

  /**
   * Update Event by EventID.
   * @param {string} eventId The event ID.
   * @param {UpdateEventDTO} event The information that need to be modified in an event.
   * @returns {Object} Return status of the event update.
   */
  @Patch(':eventId')
  async updateEvent(
    @Headers() headers,
    @Param('eventId') eventId: string,
    @Body() event: UpdateEventDTO,
  ) {
    await this.eventsService.updateEvent(headers, eventId, event);
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
  async removeEvent(@Headers() headers, @Param('id') eventId: string) {
    await this.eventsService.deleteEvent(headers, eventId);
    return {
      status: HttpStatus.OK,
      message: 'Event deleted successfully',
    };
  }
}

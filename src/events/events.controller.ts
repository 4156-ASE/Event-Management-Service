import {
  Body,
  Controller,
  Post,
  Param,
  Patch,
  Delete,
  HttpStatus,
  Headers,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import {
  EventCreateReq,
  EventDetail,
  UpdateEventDTO,
} from './models/event.dto';
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
   */
  @Get()
  async getEvents(
    @Query() query: { pid: string },
    @Req() req: Request,
  ): Promise<EventDetail[]> {
    return await this.eventsService.getEvents({
      cid: req.client.cid,
      pid: query.pid,
    });
  }

  /**
   * Get a event by EventID.
   */
  @Get(':id')
  async getEvent(
    @Param('id') eventId: string,
    @Req() req: Request,
  ): Promise<EventDetail> {
    return await this.eventsService.getEvent(req.client.cid, eventId);
  }

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

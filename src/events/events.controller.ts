import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  createEvent(
    @Body('title') eventTitle: string,
    @Body('description') eventDesc: string,
  ): any {
    const generatedID = this.eventsService.insertEvent(eventTitle, eventDesc);
    return { id: generatedID };
  }

  @Get()
  getAllEvents() {
    return this.eventsService.getEvents();
  }

  @Get(':id')
  getEvent(@Param('id') eventId: string) {
    return this.eventsService.getEvent(eventId);
  }

  @Patch(':id')
  updateEvent(
    @Param('id') eventId: string,
    @Body('title') eventTitle: string,
    @Body('description') eventDesc: string,
  ) {
    this.eventsService.updateEvent(eventId, eventTitle, eventDesc);
    return null;
  }

  @Delete(':id')
  removeEvent(@Param('id') eventId: string) {
    this.eventsService.deleteEvent(eventId);
    return null;
  }
}

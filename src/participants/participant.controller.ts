import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Res,
  Body,
  NotFoundException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { ParticipantsService } from './participant.service';
import { Response } from 'express';

@Controller('participants')
export class ParticipantsController {
  // Injecting ParticipantsService
  constructor(private readonly participantsService: ParticipantsService) {}

  // Invite a participant to an event
  @Post(':eventId')
  async inviteParticipant(
    @Param('eventId') eventId: string, // Extract the 'eventId' parameter from the URL
    @Body() user: { first_name: string; last_name: string; email: string }, // Extract user details from the request body
  ) {
    try {
      // Use the service method to invite the participant
      await this.participantsService.inviteParticipant(eventId, user);
      return { message: 'Invitations sent successfully.' };
    } catch (e) {
      // Handle specific exceptions and re-throw them
      if (e instanceof NotFoundException) {
        throw new NotFoundException(e.message);
      } else {
        throw new InternalServerErrorException(
          'Failed to invite the participant',
        );
      }
    }
  }

  // Update the details of a participant in an event
  @Patch(':event_id/:pid')
  async updateParticipantDetails(
    @Param('event_id') eventId: string, // Extract event id from URL
    @Param('pid') pid: string, // Extract participant id from URL.
    @Body() user: { first_name: string; last_name: string; email: string }, // Extract user details from request body
  ) {
    try {
      // Use the service method to update participant details
      const updatedUser = await this.participantsService.updateParticipant(
        eventId,
        pid,
        user,
      );
      // Return the updated details
      return {
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
      };
    } catch (e) {
      // Handle specific exceptions
      if (e instanceof NotFoundException) {
        throw new NotFoundException(e.message);
      } else {
        throw new InternalServerErrorException(
          'Failed to update the participant',
        );
      }
    }
  }

  // Delete a participant
  @Delete(':pid')
  async deleteParticipant(@Param('pid') pid: string) {
    // Extract 'pid' from URL
    try {
      // Use the service method to delete the participant
      await this.participantsService.deleteParticipant(pid);
      return { message: 'Participant deleted successfully' };
    } catch (e) {
      // Handle exceptions
      if (e instanceof NotFoundException) {
        throw new NotFoundException(e.message);
      } else {
        throw new InternalServerErrorException(
          'Failed to delete the participant',
        );
      }
    }
  }

  // List participants of an event
  @Get('/allParticipants/:eventId')
  async listParticipants(@Param('eventId') eventId: string) {
    try {
      // Fetch the participants using the service method
      const participants =
        await this.participantsService.listParticipants(eventId);
      // Map over the results to shape the response
      return participants.map((p) => ({
        pid: p.id,
        first_name: p.user.first_name,
        last_name: p.user.last_name,
        email: p.user.email,
        status: p.status,
      }));
    } catch (e) {
      // Handle exceptions
      if (e instanceof NotFoundException) {
        throw new NotFoundException(e.message);
      } else {
        throw new InternalServerErrorException('Failed to fetch participants');
      }
    }
  }

  // Update the status of a participant
  @Patch('respond')
  async updateParticipantStatus(
    @Body('id') id: number,
    @Body('status') status: string,
    @Body('eventId') eventId: string,
  ) {
    try {
      // Use the service method to update the participant's status
      await this.participantsService.updateStatus(pid, eventId, status);
      return {
        status: HttpStatus.OK,
      };
    } catch (e) {
      // Handle exceptions
      if (e instanceof NotFoundException) {
        throw new NotFoundException(e.message);
      } else {
        throw new InternalServerErrorException('Failed to update the status');
      }
    }
  }

  @Get('sendEmailToAllParticipants/:eventId')
  async sendEmailToAllParticipants(@Param("eventId") eventId: string) {
    // Use the service method to invite the participant
    console.log("send email to all participants");
    console.log("event id: " + eventId);
    await this.participantsService.sendEmailToAllParticipants(eventId);
    return { message: 'Invitations sent successfully.' };
    
  }

  @Get('redirect')
  getRedirectPage(
    @Param('memberId') pid: number,
    @Param('decision') decision: string,
    @Param('eventId') eventId: string,
    @Res() res: Response
  ) {
    // Use the service method to update the participant's status
    const htmlContent = this.participantsService.getRedirectPage();
    res.set('Content-Type', 'text/html');
    res.send(htmlContent);
    
  }

}
